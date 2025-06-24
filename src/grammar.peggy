/*
 * Peggy grammar with support for Function Calls.
 * Corrected ArgumentList action block to resolve runtime error.
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

// A Tag is any expression starting with '<'. The order is critical for precedence.
Tag
  = FunctionCall
  / Expression
  / IndirectVariable
  / Variable
  / GenericTag

// A Literal is any character sequence that does not start with '<'.
Literal
  = value:$([^<]+) { return { type: 'Literal', value }; }


// --- Function Call ---
FunctionCall "Function Call"
  = "<{" ws name:Ident ws "(" ws args:ArgumentList? ws ")" ws "}>" {
      return {
        type: 'FunctionCall',
        functionName: name,
        args: args || []
      };
    }

// Parses a comma-separated list of arguments.
ArgumentList
  = head:Argument rest:(ws "," ws tail:ArgumentList)? {
      // 'rest' will be null if there are no more arguments.
      // If it exists, it's an array like [ws, ",", ws, argList],
      // and we want the argList from the recursive call which is at index 3.
      const tailArgs = rest ? rest[3] : [];
      return [head, ...tailArgs];
    }

// Parses a single argument, which is a full sub-template.
Argument "Argument"
  = value:BalancedArgumentText {
      // Recursively parse the argument content as a new template.
      return peg$parse(value.trim(), options);
    }

// Matches a balanced string of text for an argument, handling nested constructs.
BalancedArgumentText
  = $( ( FunctionCall / !(ws ("," / ")")) . )* )


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

ws "optional whitespace" = [ \t\n\r]*
