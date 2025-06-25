/*
 * Peggy grammar with support for Function Calls.
 * This version is INSTRUMENTED WITH LOGGING for deep debugging.
 */
{{
  // This block is for code available in the global scope of the module.
}}

{
  // This block is the "per-parse-initializer". Code here is executed
  // for each call to `parse()` and has access to the `options` object.

  // This helper function enables conditional logging.
  const log = (rule, ...args) => {
    if (options && options.enablePeggyTracing) {
      console.log(`[PEG_TRACE] MATCH: ${rule}`, ...args);
    }
  };

  function buildTemplate(parts) {
    if (!parts || parts.length === 0) {
      return { type: 'Template', body: [] };
    }

    const mergedBody = [];
    if (parts.length > 0 && parts[0]) {
      mergedBody.push(parts[0]);
    }

    for (let i = 1; i < parts.length; i++) {
      if (!parts[i]) continue;
      const last = mergedBody[mergedBody.length - 1];
      const current = parts[i];
      if (last.type === 'Literal' && current.type === 'Literal') {
        last.value += current.value;
      } else {
        mergedBody.push(current);
      }
    }
    return { type: 'Template', body: mergedBody };
  }
}

// Top-level entry point.
Start "Template"
  = parts:(Tag / Literal)* { log("Start", text()); return buildTemplate(parts); }

// A Tag is any expression starting with '<'. The order is critical for precedence.
Tag
  = FunctionCall
  / Expression
  / SubTemplate
  / IndirectVariable
  / Variable

// MODIFIED: A Literal is any character sequence that does not start with a known tag.
Literal "Literal Text"
  = value:$( ( [^<]+ / "<" !("{" / "~" / "#" / "`") )+ ) { log("Literal", value); return { type: 'Literal', value }; }


// --- Function Call ---
FunctionCall "Function Call"
  = "<{" ws name:Ident ws "(" ws args:ArgumentList? ws ")" ws "}>" {
      log("FunctionCall", text());
      return { type: 'FunctionCall', functionName: name, args: args || [] };
    }

ArgumentList
  = head:Argument rest:(ws "," ws tail:ArgumentList)? {
      log("ArgumentList", text());
      const tailArgs = rest ? rest[3] : [];
      return [head, ...tailArgs];
    }

Argument "Argument"
  = value:BalancedArgumentText { log("Argument", value); return peg$parse(value.trim(), options); }

BalancedArgumentText "Argument Text"
  = text:$([^,)]*) { log("BalancedArgumentText", text); return text; }


// --- Expression and Sub-Template ---

Expression "Expression"
  = "<~" body:(ConditionalBody / CrossProductBody) "~>" { log("Expression", text()); return body; }

SubTemplate "SubTemplate"
  = "<`" body:SubTemplateBody "`>" { log("SubTemplate", text()); return buildTemplate(body); }
SubTemplateBody "Body of a SubTemplate"
  = parts:(Tag / SubTemplateLiteral)* { log("SubTemplateBody", text()); return parts; }

SubTemplateLiteral
  = value:$( ( [^<`]+ / "<" !("{" / "~" / "#" / "`") / "`" !">" )+ ) { log("SubTemplateLiteral", value); return { type: 'Literal', value }; }


// --- Conditional and Cross-Product Components ---

ConditionalBody
  = parts:(TruePart / FalsePart / Condition)+
    {
      log("ConditionalBody", text());
      let trueBranch = null, falseBranch = null, condition = null;
      const defaultEmptyTemplate = { type: 'Template', body: [{ type: 'Literal', value: '' }] };
      for (const part of parts) {
        if (part.kind === 'TruePart') trueBranch = part.template;
        if (part.kind === 'FalsePart') falseBranch = part.template;
        if (part.kind === 'Condition') condition = part.template;
      }
      if (!condition) throw new Error("Conditional expression is missing a condition part '<?...?>'.");
      return { type: 'Conditional', condition, trueBranch: trueBranch || defaultEmptyTemplate, falseBranch: falseBranch || defaultEmptyTemplate };
    }

CrossProductBody
  = slice:Slice? ws template:SubTemplate ws multiplier:Multiplier ws iterator:ArrayRule {
      log("CrossProductBody", text());
      return { type: 'CrossProduct', template, iterator, delimiter: multiplier.delimiter, terminator: multiplier.terminator, sliceTemplate: slice || undefined };
    }

// MODIFIED: The Slice rule now parses a full template inside the braces.
Slice "Array Slice"
  = "{" body:SliceBody "}" {
      log("Slice", text());
      return buildTemplate(body); // Returns a TemplateNode
    }
SliceBody = parts:(Tag / SliceLiteral)* { log("SliceBody", text()); return parts; }
SliceLiteral = value:$([^<}]+ / "<" !("{" / "~" / "#" / "`"))+ { log("SliceLiteral", value); return { type: 'Literal', value }; }

Multiplier = ConditionalMultiplier / SimpleMultiplier
SimpleMultiplier = tag:"<*>" { log("SimpleMultiplier", tag); return { delimiter: null, terminator: null }; }

ConditionalMultiplier "Conditional Multiplier"
  = "<*?" content:$[^>]* ">" {
      log("ConditionalMultiplier", content);
      const colonIndex = content.lastIndexOf(":");
      if (colonIndex !== -1) return { delimiter: content.substring(0, colonIndex), terminator: content.substring(colonIndex + 1) };
      else return { delimiter: content, terminator: "" };
    }

TruePart "True Part" = "<+>" template:SubTemplate { log("TruePart", text()); return { kind: 'TruePart', template }; }
FalsePart "False Part" = "<->" template:SubTemplate { log("FalsePart", text()); return { kind: 'FalsePart', template }; }

Condition "Condition"
  = "<?" body:ConditionBody "?>" { log("Condition", text()); return { kind: 'Condition', template: buildTemplate(body) }; }
ConditionBody = parts:(Tag / ConditionLiteral)* { log("ConditionBody", text()); return parts; }

ConditionLiteral = value:$( ( [^<?]+ / "<" !("{" / "~" / "#" / "`") / "?" !">" )+ ) { log("ConditionLiteral", value); return { type: 'Literal', value }; }


// --- Variable, Indirect, and Array Rules (Now Fully Recursive) ---

Variable
  = lt:"<#" name:VariableBody "#>" { log("Variable", text()); return { type: 'Variable', name: buildTemplate(name), raw: text() }; }
VariableBody = parts:(Tag / VariableLiteral)* { log("VariableBody", text()); return parts; }

VariableLiteral = value:$( ( [^<#]+ / "<" !("{" / "~" / "#" / "`") / "#" !">" )+ ) { log("VariableLiteral", value); return { type: 'Literal', value }; }

IndirectVariable
  = lt:"<##" name:IndirectVariableBody "##>" { log("IndirectVariable", text()); return { type: 'IndirectVariable', name: buildTemplate(name), raw: text() }; }
IndirectVariableBody = parts:(Tag / IndirectVariableLiteral)* { log("IndirectVariableBody", text()); return parts; }

IndirectVariableLiteral = value:$( ( [^<#]+ / "<" !("{" / "~" / "#" / "`") / "#" !"#>" )+ ) { log("IndirectVariableLiteral", value); return { type: 'Literal', value }; }

ArrayRule "Array"
  = "<[" ws name:ArrayBody ws "]>" { log("ArrayRule", text()); return { type: 'Array', name: buildTemplate(name) }; }
ArrayBody = parts:(Tag / ArrayLiteral)* { log("ArrayBody", text()); return parts; }

ArrayLiteral = value:$( ( [^<\]]+ / "<" !("{" / "~" / "#" / "`") )+ ) { log("ArrayLiteral", value); return { type: 'Literal', value }; }


// --- Primitives ---
Ident = ident:$( [a-zA-Z] [a-zA-Z_0-9.-]* ) { log("Ident", ident); return ident; }
ws "optional whitespace" = ws:$[ \t\n\r]* { log("Whitespace", `"${ws}"`); return ws; }
