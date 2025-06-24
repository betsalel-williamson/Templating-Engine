/*
 * Peggy grammar with a corrected conditional multiplier rule.
 */
{{
  import { AstNode } from "../dist/types.js";

  function buildTemplate(parts) {
    return { type: 'Template', body: parts.filter(p => p) };
  }
}}

// Top-level entry point.
Start "Template"
  = parts:(Tag / Literal)* { return buildTemplate(parts); }

// A Tag is any expression starting with '<'. The order is critical.
Tag
  = Expression
  / IndirectVariable
  / Variable
  / GenericTag

// A Literal is any character sequence that does not start with '<'.
Literal
  = value:$([^<]+) { return { type: 'Literal', value }; }


// --- Tag Definitions ---

// Unified handler for <~...~> expressions.
Expression "Expression"
  = "<~" body:(ConditionalBody / CrossProductBody) "~>" { return body; }

// A SubTemplate is a block of text wrapped in <`...`> to be recursively parsed.
SubTemplate
  = "<`" templateText:$((!"`>") .)* "`>" {
      return peg$parse(templateText, options);
    }

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
  = template:SubTemplate
    multiplier:Multiplier
    iterator:ArrayRule
    {
      return {
        type: 'CrossProduct',
        template,
        iterator,
        delimiter: multiplier.delimiter,
        terminator: multiplier.terminator
      };
    }

// Multiplier can be simple or conditional
Multiplier
  = ConditionalMultiplier
  / SimpleMultiplier

SimpleMultiplier
  = "<*>" { return { delimiter: null, terminator: null }; }

// Corrected, simpler rule for the conditional multiplier.
ConditionalMultiplier
  = "<*?" delimiter:$([^:]*) ":" terminator:$([^>]*) ">" {
      return { delimiter, terminator };
    }

// Component rules for ConditionalBody.
TruePart "True Part"
  = "<+>" template:SubTemplate { return { kind: 'TruePart', template }; }

FalsePart "False Part"
  = "<->" template:SubTemplate { return { kind: 'FalsePart', template }; }

Condition "Condition"
  = "<?" templateText:$( (!("?>") .)* ) "?>" { return { kind: 'Condition', template: peg$parse(templateText, options) }; }


// Standalone tag rules
Variable
  = "<#" name:Ident "#>" { return { type: 'Variable', name }; }

IndirectVariable
  = "<##" name:Ident "##>" { return { type: 'IndirectVariable', name }; }

ArrayRule "Array"
  = "<[" name:(Ident / Variable) "]>" { return { type: 'Array', name }; }

GenericTag
  = value:$( "<" [^>]* ">" ) { return { type: 'Literal', value }; }

Ident
  = $([a-zA-Z] [a-zA-Z_0-9.-]*)
