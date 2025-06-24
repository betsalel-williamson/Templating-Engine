/*
 * Peggy grammar using the correct internal recursive parsing function.
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

// A Tag is one of our special constructs.
Tag
  = CrossProduct
  / Conditional
  / IndirectVariable
  / Variable
  / OtherContent

// A Literal is any character sequence that does not start a tag.
Literal
  = value:$([^<]+) { return { type: 'Literal', value }; }


// --- Tag Definitions using recursive parsing ---

CrossProduct
  = "<~"
    templateText:$((!"<*>") .)*
    "<*>"
    iterator:ArrayRule
    "~>"
    {
      // FIX: Use `peg$parse` for recursive calls within the grammar's scope.
      const template = peg$parse(templateText, options);
      return { type: 'CrossProduct', template, iterator };
    }

Conditional
  = "<+"
    trueText:$((!"<->") .)*
    "<->"
    falseText:$((!"<?>") .)*
    "<?"
    condText:$((!"?>") .)*
    "?>"
    ">"
    {
      // FIX: Use `peg$parse` for recursive calls within the grammar's scope.
      const trueBranch = peg$parse(trueText, options);
      const falseBranch = peg$parse(falseText, options);
      const condition = peg$parse(condText, options);
      return { type: 'Conditional', condition, trueBranch, falseBranch };
    }

Variable
  = "<#" name:Ident "#>" { return { type: 'Variable', name }; }

IndirectVariable
  = "<##" name:Ident "##>" { return { type: 'IndirectVariable', name }; }

ArrayRule "Array"
  = "<[" name:(Ident / Variable) "]>" { return { type: 'Array', name }; }

OtherContent
  = value:$("<" [^>]* ">") { return { type: 'Literal', value }; }

Ident
  = $([a-zA-Z] [a-zA-Z_0-9.-]*)
