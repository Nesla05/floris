define(
  "ace/mode/doc_comment_highlight_rules",
  [
    "require",
    "exports",
    "module",
    "ace/lib/oop",
    "ace/mode/text_highlight_rules",
  ],
  function (e, t, n) {
    "use strict";
    var r = e("../lib/oop"),
      i = e("./text_highlight_rules").TextHighlightRules,
      s = function () {
        this.$rules = {
          start: [
            { token: "comment.doc.tag", regex: "@[\\w\\d_]+" },
            s.getTagRule(),
            { defaultToken: "comment.doc", caseInsensitive: !0 },
          ],
        };
      };
    r.inherits(s, i),
      (s.getTagRule = function (e) {
        return {
          token: "comment.doc.tag.storage.type",
          regex: "\\b(?:TODO|FIXME|XXX|HACK)\\b",
        };
      }),
      (s.getStartRule = function (e) {
        return { token: "comment.doc", regex: "\\/\\*(?=\\*)", next: e };
      }),
      (s.getEndRule = function (e) {
        return { token: "comment.doc", regex: "\\*\\/", next: e };
      }),
      (t.DocCommentHighlightRules = s);
  },
),
  define(
    "ace/mode/csharp_highlight_rules",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/doc_comment_highlight_rules",
      "ace/mode/text_highlight_rules",
    ],
    function (e, t, n) {
      "use strict";
      var r = e("../lib/oop"),
        i = e("./doc_comment_highlight_rules").DocCommentHighlightRules,
        s = e("./text_highlight_rules").TextHighlightRules,
        o = function () {
          var e = this.createKeywordMapper(
            {
              "variable.language": "this",
              keyword:
                "abstract|async|await|event|new|struct|as|explicit|null|switch|base|extern|object|this|bool|false|operator|throw|break|finally|out|true|byte|fixed|override|try|case|float|params|typeof|catch|for|private|uint|char|foreach|protected|ulong|checked|goto|public|unchecked|class|if|readonly|unsafe|const|implicit|ref|ushort|continue|in|return|using|decimal|int|sbyte|virtual|default|interface|sealed|volatile|delegate|internal|partial|short|void|do|is|sizeof|while|double|lock|stackalloc|else|long|static|enum|namespace|string|var|dynamic",
              "constant.language": "null|true|false",
            },
            "identifier",
          );
          (this.$rules = {
            start: [
              { token: "comment", regex: "\\/\\/.*$" },
              i.getStartRule("doc-start"),
              { token: "comment", regex: "\\/\\*", next: "comment" },
              {
                token: "string",
                regex: /'(?:.|\\(:?u[\da-fA-F]+|x[\da-fA-F]+|[tbrf'"n]))?'/,
              },
              {
                token: "string",
                start: '"',
                end: '"|$',
                next: [
                  {
                    token: "constant.language.escape",
                    regex: /\\(:?u[\da-fA-F]+|x[\da-fA-F]+|[tbrf'"n])/,
                  },
                  { token: "invalid", regex: /\\./ },
                ],
              },
              {
                token: "string",
                start: '@"',
                end: '"',
                next: [{ token: "constant.language.escape", regex: '""' }],
              },
              {
                token: "string",
                start: /\$"/,
                end: '"|$',
                next: [
                  { token: "constant.language.escape", regex: /\\(:?$)|{{/ },
                  {
                    token: "constant.language.escape",
                    regex: /\\(:?u[\da-fA-F]+|x[\da-fA-F]+|[tbrf'"n])/,
                  },
                  { token: "invalid", regex: /\\./ },
                ],
              },
              { token: "constant.numeric", regex: "0[xX][0-9a-fA-F]+\\b" },
              {
                token: "constant.numeric",
                regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b",
              },
              {
                token: "constant.language.boolean",
                regex: "(?:true|false)\\b",
              },
              { token: e, regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b" },
              {
                token: "keyword.operator",
                regex:
                  "!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void)",
              },
              {
                token: "keyword",
                regex:
                  "^\\s*#(if|else|elif|endif|define|undef|warning|error|line|region|endregion|pragma)",
              },
              { token: "punctuation.operator", regex: "\\?|\\:|\\,|\\;|\\." },
              { token: "paren.lparen", regex: "[[({]" },
              { token: "paren.rparen", regex: "[\\])}]" },
              { token: "text", regex: "\\s+" },
            ],
            comment: [
              { token: "comment", regex: "\\*\\/", next: "start" },
              { defaultToken: "comment" },
            ],
          }),
            this.embedRules(i, "doc-", [i.getEndRule("start")]),
            this.normalizeRules();
        };
      r.inherits(o, s), (t.CSharpHighlightRules = o);
    },
  ),
  define(
    "ace/mode/matching_brace_outdent",
    ["require", "exports", "module", "ace/range"],
    function (e, t, n) {
      "use strict";
      var r = e("../range").Range,
        i = function () {};
      (function () {
        (this.checkOutdent = function (e, t) {
          return /^\s+$/.test(e) ? /^\s*\}/.test(t) : !1;
        }),
          (this.autoOutdent = function (e, t) {
            var n = e.getLine(t),
              i = n.match(/^(\s*\})/);
            if (!i) return 0;
            var s = i[1].length,
              o = e.findMatchingBracket({ row: t, column: s });
            if (!o || o.row == t) return 0;
            var u = this.$getIndent(e.getLine(o.row));
            e.replace(new r(t, 0, t, s - 1), u);
          }),
          (this.$getIndent = function (e) {
            return e.match(/^\s*/)[0];
          });
      }).call(i.prototype),
        (t.MatchingBraceOutdent = i);
    },
  ),
  define(
    "ace/mode/folding/cstyle",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/range",
      "ace/mode/folding/fold_mode",
    ],
    function (e, t, n) {
      "use strict";
      var r = e("../../lib/oop"),
        i = e("../../range").Range,
        s = e("./fold_mode").FoldMode,
        o = (t.FoldMode = function (e) {
          e &&
            ((this.foldingStartMarker = new RegExp(
              this.foldingStartMarker.source.replace(
                /\|[^|]*?$/,
                "|" + e.start,
              ),
            )),
            (this.foldingStopMarker = new RegExp(
              this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + e.end),
            )));
        });
      r.inherits(o, s),
        function () {
          (this.foldingStartMarker = /([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/),
            (this.foldingStopMarker = /^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/),
            (this.singleLineBlockCommentRe = /^\s*(\/\*).*\*\/\s*$/),
            (this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/),
            (this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/),
            (this._getFoldWidgetBase = this.getFoldWidget),
            (this.getFoldWidget = function (e, t, n) {
              var r = e.getLine(n);
              if (
                this.singleLineBlockCommentRe.test(r) &&
                !this.startRegionRe.test(r) &&
                !this.tripleStarBlockCommentRe.test(r)
              )
                return "";
              var i = this._getFoldWidgetBase(e, t, n);
              return !i && this.startRegionRe.test(r) ? "start" : i;
            }),
            (this.getFoldWidgetRange = function (e, t, n, r) {
              var i = e.getLine(n);
              if (this.startRegionRe.test(i))
                return this.getCommentRegionBlock(e, i, n);
              var s = i.match(this.foldingStartMarker);
              if (s) {
                var o = s.index;
                if (s[1]) return this.openingBracketBlock(e, s[1], n, o);
                var u = e.getCommentFoldRange(n, o + s[0].length, 1);
                return (
                  u &&
                    !u.isMultiLine() &&
                    (r
                      ? (u = this.getSectionRange(e, n))
                      : t != "all" && (u = null)),
                  u
                );
              }
              if (t === "markbegin") return;
              var s = i.match(this.foldingStopMarker);
              if (s) {
                var o = s.index + s[0].length;
                return s[1]
                  ? this.closingBracketBlock(e, s[1], n, o)
                  : e.getCommentFoldRange(n, o, -1);
              }
            }),
            (this.getSectionRange = function (e, t) {
              var n = e.getLine(t),
                r = n.search(/\S/),
                s = t,
                o = n.length;
              t += 1;
              var u = t,
                a = e.getLength();
              while (++t < a) {
                n = e.getLine(t);
                var f = n.search(/\S/);
                if (f === -1) continue;
                if (r > f) break;
                var l = this.getFoldWidgetRange(e, "all", t);
                if (l) {
                  if (l.start.row <= s) break;
                  if (l.isMultiLine()) t = l.end.row;
                  else if (r == f) break;
                }
                u = t;
              }
              return new i(s, o, u, e.getLine(u).length);
            }),
            (this.getCommentRegionBlock = function (e, t, n) {
              var r = t.search(/\s*$/),
                s = e.getLength(),
                o = n,
                u = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/,
                a = 1;
              while (++n < s) {
                t = e.getLine(n);
                var f = u.exec(t);
                if (!f) continue;
                f[1] ? a-- : a++;
                if (!a) break;
              }
              var l = n;
              if (l > o) return new i(o, r, l, t.length);
            });
        }.call(o.prototype);
    },
  ),
  define(
    "ace/mode/folding/csharp",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/range",
      "ace/mode/folding/cstyle",
    ],
    function (e, t, n) {
      "use strict";
      var r = e("../../lib/oop"),
        i = e("../../range").Range,
        s = e("./cstyle").FoldMode,
        o = (t.FoldMode = function (e) {
          e &&
            ((this.foldingStartMarker = new RegExp(
              this.foldingStartMarker.source.replace(
                /\|[^|]*?$/,
                "|" + e.start,
              ),
            )),
            (this.foldingStopMarker = new RegExp(
              this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + e.end),
            )));
        });
      r.inherits(o, s),
        function () {
          (this.usingRe = /^\s*using \S/),
            (this.getFoldWidgetRangeBase = this.getFoldWidgetRange),
            (this.getFoldWidgetBase = this.getFoldWidget),
            (this.getFoldWidget = function (e, t, n) {
              var r = this.getFoldWidgetBase(e, t, n);
              if (!r) {
                var i = e.getLine(n);
                if (/^\s*#region\b/.test(i)) return "start";
                var s = this.usingRe;
                if (s.test(i)) {
                  var o = e.getLine(n - 1),
                    u = e.getLine(n + 1);
                  if (!s.test(o) && s.test(u)) return "start";
                }
              }
              return r;
            }),
            (this.getFoldWidgetRange = function (e, t, n) {
              var r = this.getFoldWidgetRangeBase(e, t, n);
              if (r) return r;
              var i = e.getLine(n);
              if (this.usingRe.test(i))
                return this.getUsingStatementBlock(e, i, n);
              if (/^\s*#region\b/.test(i)) return this.getRegionBlock(e, i, n);
            }),
            (this.getUsingStatementBlock = function (e, t, n) {
              var r = t.match(this.usingRe)[0].length - 1,
                s = e.getLength(),
                o = n,
                u = n;
              while (++n < s) {
                t = e.getLine(n);
                if (/^\s*$/.test(t)) continue;
                if (!this.usingRe.test(t)) break;
                u = n;
              }
              if (u > o) {
                var a = e.getLine(u).length;
                return new i(o, r, u, a);
              }
            }),
            (this.getRegionBlock = function (e, t, n) {
              var r = t.search(/\s*$/),
                s = e.getLength(),
                o = n,
                u = /^\s*#(end)?region\b/,
                a = 1;
              while (++n < s) {
                t = e.getLine(n);
                var f = u.exec(t);
                if (!f) continue;
                f[1] ? a-- : a++;
                if (!a) break;
              }
              var l = n;
              if (l > o) return new i(o, r, l, t.length);
            });
        }.call(o.prototype);
    },
  ),
  define(
    "ace/mode/csharp",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/text",
      "ace/mode/csharp_highlight_rules",
      "ace/mode/matching_brace_outdent",
      "ace/mode/behaviour/cstyle",
      "ace/mode/folding/csharp",
    ],
    function (e, t, n) {
      "use strict";
      var r = e("../lib/oop"),
        i = e("./text").Mode,
        s = e("./csharp_highlight_rules").CSharpHighlightRules,
        o = e("./matching_brace_outdent").MatchingBraceOutdent,
        u = e("./behaviour/cstyle").CstyleBehaviour,
        a = e("./folding/csharp").FoldMode,
        f = function () {
          (this.HighlightRules = s),
            (this.$outdent = new o()),
            (this.$behaviour = new u()),
            (this.foldingRules = new a());
        };
      r.inherits(f, i),
        function () {
          (this.lineCommentStart = "//"),
            (this.blockComment = { start: "/*", end: "*/" }),
            (this.getNextLineIndent = function (e, t, n) {
              var r = this.$getIndent(t),
                i = this.getTokenizer().getLineTokens(t, e),
                s = i.tokens;
              if (s.length && s[s.length - 1].type == "comment") return r;
              if (e == "start") {
                var o = t.match(/^.*[\{\(\[]\s*$/);
                o && (r += n);
              }
              return r;
            }),
            (this.checkOutdent = function (e, t, n) {
              return this.$outdent.checkOutdent(t, n);
            }),
            (this.autoOutdent = function (e, t, n) {
              this.$outdent.autoOutdent(t, n);
            }),
            (this.createWorker = function (e) {
              return null;
            }),
            (this.$id = "ace/mode/csharp");
        }.call(f.prototype),
        (t.Mode = f);
    },
  );
(function () {
  window.require(["ace/mode/csharp"], function (m) {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m;
    }
  });
})();
