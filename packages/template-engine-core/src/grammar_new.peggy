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

Start "New Template"
  = parts:TemplateParts* { return buildTemplate(parts); }

TemplateParts
  = OutputTag
  / ControlTag
  / Literal

OutputTag
  = "{{" ws expression:Expression ws "}}" {
      return {
        type: 'OutputExpression',
        expression,
        raw: text()
      };
    }

ControlTag
  = ForBlock
  / IfBlock

ForBlock
  = open:"{%" ws "for" ws item:Ident ws "in" ws collection:Expression ws close:"%}" body:TemplateParts* endfor:"{%" ws "endfor" ws "%}" {
      return { type: 'ForBlock', item, collection, body: buildTemplate(body) };
    }

IfBlock
  = open:"{%" ws "if" ws condition:IfCondition ws close:"%}" trueBranch:TemplateParts* elseBranch:ElseBlock? endif:"{%" ws "endif" ws "%}" {
      return {
        type: 'IfBlock',
        condition,
        trueBranch: buildTemplate(trueBranch),
        falseBranch: elseBranch ? elseBranch.body : buildTemplate([])
      };
    }

ElseBlock
  = "{%" ws "else" ws "%}" body:TemplateParts* {
      return { body: buildTemplate(body) };
    }

IfCondition
  = "not" ws operand:IfCondition {
      return { type: 'NotCondition', operand };
    }
  / expression:Expression {
      return { type: 'ExpressionCondition', expression };
    }

Expression
  = pipeline:FilterPipeline { return pipeline; }

FilterPipeline
  = input:PrimaryExpression filters:(ws "|" ws filter:FilterCall)* {
      const filterNodes = filters.map((entry) => entry[3]);
      return buildFilterPipeline(input, filterNodes);
    }

FilterCall
  = name:Ident args:("(" ws args:FilterArgList? ws ")")? {
      return { name, args: args && args[2] ? args[2] : [] };
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
      return { type: 'BracketLookup', key };
    }

PropertyAccess
  = head:Ident tail:("." segment:Ident)+ {
      return buildPropertyAccess(head, tail.map((entry) => entry[1]));
    }

Identifier
  = name:Ident {
      return { type: 'Identifier', name };
    }

ConcatExpression
  = head:ConcatPart tail:(ws "~" ws part:ConcatPart)* {
      if (!tail || tail.length === 0) {
        return head;
      }
      return { type: 'Concat', parts: [head, ...tail.map((entry) => entry[3])] };
    }

ConcatPart
  = StringLiteral
  / name:Ident { return { type: 'Identifier', name }; }

StringLiteral
  = '"' value:DoubleStringContent '"' {
      return { type: 'StringLiteral', value };
    }
  / "'" value:SingleStringContent "'" {
      return { type: 'StringLiteral', value };
    }

DoubleStringContent
  = chars:$([^"\\] / "\\" .)* { return chars; }

SingleStringContent
  = chars:$([^'\\] / "\\" .)* { return chars; }

Literal
  = value:$((!TagStart .)+) { return { type: 'Literal', value }; }

TagStart
  = "{{" / "{%"

Ident
  = $([a-zA-Z] [a-zA-Z_0-9-]*)

ws "optional whitespace"
  = [ \t\n\r]*
