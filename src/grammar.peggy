/*
 * Peggy grammar with support for Function Calls.
 * This version uses robust patterns for parsing multi-line content.
 */
{{
  // This block is for code available in the global scope of the module.
}}

{
  // This block is the "per-parse-initializer". Code here is executed
  // for each call to `parse()` and has access to the `options` object.

  // This helper function enables conditional logging.
  const log = (...args) => {
    if (options && options.enablePeggyTracing) {
      console.log('[PEG_TRACE]', ...args);
    }
  };

  function buildTemplate(parts) {
    // Merge consecutive Literal nodes for a cleaner AST and better performance.
    if (!parts || parts.length === 0) {
      return { type: 'Template', body: [] };
    }

    const mergedBody = [parts[0]];
    for (let i = 1; i < parts.length; i++) {
      const last = mergedBody[mergedBody.length - 1];
      const current = parts[i];
      if (last.type === 'Literal' && current.type === 'Literal') {
        last.value += current.value;
      } else {
        mergedBody.push(current);
      }
    }
    return { type: 'Template', body: mergedBody.filter(p => p) };
  }
}

// Top-level entry point.
Start "Template"
  = parts:(Tag / Literal)* { return buildTemplate(parts); }

// A Tag is any expression starting with '<'. The order is critical for precedence.
Tag
  = FunctionCall
  / Expression
  / IndirectVariable
  / Variable

// A Literal is any character sequence that does not start with '<'.
Literal
  = value:$([^<]+) { log("MATCH: Literal", value); return { type: 'Literal', value }; }


// --- Function Call ---
FunctionCall "Function Call"
  = "<{" ws name:Ident ws "(" ws args:ArgumentList? ws ")" ws "}>" {
      return {
        type: 'FunctionCall',
        functionName: name,
        args: args || []
      };
    }

ArgumentList
  = head:Argument rest:(ws "," ws tail:ArgumentList)? {
      const tailArgs = rest ? rest[3] : [];
      return [head, ...tailArgs];
    }

Argument "Argument"
  = value:BalancedArgumentText {
      return peg$parse(value.trim(), options);
    }

// A robust and simple pattern for matching argument text as a single string.
BalancedArgumentText
  = text:$( ( !("," / ")") . )* ) { return text; }


// --- Tag Definitions ---

// Unified handler for <~...~> expressions.
Expression "Expression"
  = "<~" body:(ConditionalBody / CrossProductBody) "~>" { return body; }

// A SubTemplate is a block of text wrapped in <`...`> to be recursively parsed.
SubTemplate "SubTemplate"
  = "<`" body:SubTemplatePart* "`>" { return buildTemplate(body); }

SubTemplatePart
  = Tag
  / value:$((!'`>') [^<])+ { log("MATCH: SubTemplateLiteral", value); return { type: 'Literal', value }; }


// Body parsers for the Expression rule.
ConditionalBody
  = parts:(TruePart / FalsePart / Condition)+
    {
      let trueBranch = null;
      let falseBranch = null;
      let condition = null;
      const defaultEmptyTemplate = { type: 'Template', body: [{ type: 'Literal', value: '' }] };

      for (const part of parts) {
        if (part.kind === 'TruePart') trueBranch = part.template;
        if (part.kind === 'FalsePart') falseBranch = part.template;
        if (part.kind === 'Condition') condition = part.template;
      }

      if (!condition) {
        throw new Error("Conditional expression is missing a condition part '<?...?>'.");
      }

      return {
        type: 'Conditional',
        condition: condition,
        trueBranch: trueBranch || defaultEmptyTemplate,
        falseBranch: falseBranch || defaultEmptyTemplate
      };
    }

CrossProductBody
  = slice:Slice? ws template:SubTemplate ws multiplier:Multiplier ws iterator:ArrayRule
    {
      return {
        type: 'CrossProduct',
        template,
        iterator,
        delimiter: multiplier.delimiter,
        terminator: multiplier.terminator,
        offset: slice ? slice.offset : undefined,
        limit: slice ? slice.limit : undefined
      };
    }

// Slicing is 0-based at the grammar level.
Slice "Array Slice"
  = "{" ws offset_str:Digits? ws comma:("," ws)? limit_str:Digits? ws "}" {
      let offset = undefined;
      let limit = undefined;

      if (offset_str !== null) {
          offset = parseInt(offset_str, 10);
      }
      if (limit_str !== null) {
          limit = parseInt(limit_str, 10);
      }

      if (offset_str !== null && comma === null && limit_str === null) {
          limit = offset;
          offset = 0;
      }
      else if (offset_str === null && comma !== null && limit_str !== null) {
          offset = 0;
      }
      return { offset, limit };
    }

Digits "Digits"
  = $[0-9]+

Multiplier
  = ConditionalMultiplier
  / SimpleMultiplier

SimpleMultiplier
  = "<*>" { return { delimiter: null, terminator: null }; }

ConditionalMultiplier "Conditional Multiplier"
  = "<*?" content:$(( !">" . )*) ">" {
      const colonIndex = content.lastIndexOf(":");
      if (colonIndex !== -1) {
          return {
              delimiter: content.substring(0, colonIndex),
              terminator: content.substring(colonIndex + 1)
          };
      } else {
          // No colon found, the entire content is the delimiter.
          return {
              delimiter: content,
              terminator: ""
          };
      }
  }

TruePart "True Part"
  = "<+>" template:SubTemplate { return { kind: 'TruePart', template }; }

FalsePart "False Part"
  = "<->" template:SubTemplate { return { kind: 'FalsePart', template }; }

// A robust pattern for matching multi-line content as a single string.
Condition "Condition"
  = "<?" templateText:$( (!("?>") .)* ) "?>" { return { kind: 'Condition', template: peg$parse(templateText, options) }; }


// Capture individual parts to reconstruct 'raw' and get 'name' directly.
Variable
  = lt:"<#" name:Ident gt:"#>" { log("MATCH: Variable", name); return { type: 'Variable', name: name, raw: lt + name + gt }; }

IndirectVariable = lt:"<##" name_content:$(!"##>" .)* gt:"##>" {
    return {
        type: 'IndirectVariable',
        name: peg$parse(name_content.trim(), options),
        raw: lt + name_content + gt
    };
}

// A robust pattern for matching multi-line content as a single string.
ArrayRule "Array"
  = "<[" ws name_content:$( ( !"]>" . )* ) ws "]>" {
    return { type: 'Array', name: peg$parse(name_content.trim(), options) };
  }

Ident
  = $([a-zA-Z] [a-zA-Z_0-9.-]*)

ws "optional whitespace" = [ \t\n\r]*
