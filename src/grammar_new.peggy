/*
 * New Peggy grammar for the modern templating syntax (Jinja2/Handlebars-like).
 * This grammar will define rules for {{ variable }} syntax.
 */
{{
  function buildTemplate(parts) {
    return { type: 'Template', body: parts.filter(p => p) };
  }
}}

// Top-level entry point.
Start "New Template"
  = parts:(NewTag / Literal)* { return buildTemplate(parts); }

// A NewTag is any expression starting with '{{'.
NewTag
  = NewVariable

// A Literal is any character sequence that does not start with '{'.
Literal
  = value:$((!"{{" .) +) { return { type: 'Literal', value }; }


// --- New Tag Definitions ---

NewVariable "New Variable"
  = open_brace:"{{" ws_pre:ws name:Ident ws_post:ws close_brace:"}}" {
      // The `name` of a VariableNode must be an AstNode that evaluates to the
      // variable's key. For a simple `{{ name }}`, this is a TemplateNode
      // containing a single LiteralNode. This makes the new syntax compatible
      // with the evaluator.
      const nameTemplate = {
        type: 'Template',
        body: [{ type: 'Literal', value: name }]
      };
      return {
        type: 'Variable',
        name: nameTemplate,
        raw: open_brace + ws_pre + name + ws_post + close_brace
      };
    }

Ident
  = $([a-zA-Z] [a-zA-Z_0-9.-]*)

ws "optional whitespace" = [ \t\n\r]*
