export interface SourcePosition {
  offset: number;
  line: number;
  column: number;
}

export interface SourceLocation {
  source?: string;
  start: SourcePosition;
  end: SourcePosition;
}

/** Optional parse-time span attached to AST nodes by Peggy grammars. */
export interface WithSourceLocation {
  location?: SourceLocation;
}
