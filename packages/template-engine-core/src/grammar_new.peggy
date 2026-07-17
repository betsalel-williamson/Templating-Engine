/*
 * Peggy grammar for the modern templating syntax (Jinja2/Handlebars-like).
 */
{{
  function buildTemplate(parts) {
    return { type: 'Template', body: parts.filter((part) => part) };
  }

  function buildPropertyAccess(head, tail) {
    return { type: 'PropertyAccess', path: [head, ...tail] };
  }

  function buildFilterPipeline(input, filters) {
    if (!filters || filters.length === 0) {
      return input;
    }
    return { type: 'FilterPipeline', input, filters };
  }
}}

{
  function withLocation(node) {
    return Object.assign(node, { location: location() });
  }
}

Start "New Template"
  = parts:TemplateParts* { return withLocation(buildTemplate(parts)); }

TemplateParts
  = OutputTag
  / ControlTag
  / Literal

OutputTag
  = "{{" ws expression:Expression ws "}}" {
      return withLocation({
        type: 'OutputExpression',
        expression,
        raw: text()
      });
    }

ControlTag
  = ForBlock
  / IfBlock

ForBlock
  = open:"{%" ws "for" ws item:Ident ws "in" ws collection:Expression ws close:"%}" body:TemplateParts* endfor:"{%" ws "endfor" ws "%}" {
      return withLocation({ type: 'ForBlock', item, collection, body: withLocation(buildTemplate(body)) });
    }

IfBlock
  = open:"{%" ws "if" ws condition:IfCondition ws close:"%}" trueBranch:TemplateParts* elseBranch:ElseBlock? endif:"{%" ws "endif" ws "%}" {
      return withLocation({
        type: 'IfBlock',
        condition,
        trueBranch: withLocation(buildTemplate(trueBranch)),
        falseBranch: elseBranch ? elseBranch.body : withLocation(buildTemplate([]))
      });
    }

ElseBlock
  = "{%" ws "else" ws "%}" body:TemplateParts* {
      return { body: withLocation(buildTemplate(body)) };
    }

IfCondition
  = "not" ws operand:IfCondition {
      return withLocation({ type: 'NotCondition', operand });
    }
  / expression:Expression {
      return withLocation({ type: 'ExpressionCondition', expression });
    }

Expression
  = pipeline:FilterPipeline { return pipeline; }

FilterPipeline
  = input:PrimaryExpression filters:(ws "|" ws filter:FilterCall)* {
      const filterNodes = filters.map((entry) => entry[3]);
      return withLocation(buildFilterPipeline(input, filterNodes));
    }

FilterCall
  = name:Ident args:("(" ws args:FilterArgList? ws ")")? {
      return withLocation({ name, args: args && args[2] ? args[2] : [] });
    }

FilterArgList
  = head:FilterArg tail:(ws "," ws arg:FilterArg)* {
      return [head, ...tail.map((entry) => entry[3])];
    }

FilterArg
  = StringLiteral
  / PrimaryExpression

PrimaryExpression
  = BracketLookup
  / PropertyAccess
  / Identifier
  / StringLiteral

BracketLookup
  = "[" ws key:ConcatExpression ws "]" {
      return withLocation({ type: 'BracketLookup', key });
    }

PropertyAccess
  = head:Ident tail:("." segment:Ident)+ {
      return withLocation(buildPropertyAccess(head, tail.map((entry) => entry[1])));
    }

Identifier
  = name:Ident {
      return withLocation({ type: 'Identifier', name });
    }

ConcatExpression
  = head:ConcatPart tail:(ws "~" ws part:ConcatPart)* {
      if (!tail || tail.length === 0) {
        return head;
      }
      return withLocation({ type: 'Concat', parts: [head, ...tail.map((entry) => entry[3])] });
    }

ConcatPart
  = StringLiteral
  / name:Ident { return withLocation({ type: 'Identifier', name }); }

StringLiteral
  = '"' value:DoubleStringContent '"' {
      return withLocation({ type: 'StringLiteral', value });
    }
  / "'" value:SingleStringContent "'" {
      return withLocation({ type: 'StringLiteral', value });
    }

DoubleStringContent
  = chars:$([^"\\] / "\\" .)* { return chars; }

SingleStringContent
  = chars:$([^'\\] / "\\" .)* { return chars; }

Literal
  = value:$((!TagStart .)+) { return withLocation({ type: 'Literal', value }); }

TagStart
  = "{{" / "{%"

Ident
  = $([a-zA-Z] [a-zA-Z_0-9-]*)

ws "optional whitespace"
  = [ \t\n\r]*
