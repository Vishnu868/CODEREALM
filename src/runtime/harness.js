/**
 * Harness generation.
 *
 * Wraps the player's function in a complete program that reads arguments from
 * stdin in the wire format described in languages.mjs, calls the function, and
 * prints the answer in the same format.
 *
 * Every harness is written against the standard library only — judge sandboxes
 * have no packages available.
 */
import { byId, entryName } from './langmeta'

export function buildProgram(langId, signature, entryCamel, userCode) {
  const name = entryName(langId, entryCamel)
  const gen = HARNESS[langId]
  if (!gen) throw new Error(`no harness for ${langId}`)
  return gen(signature, name, userCode)
}

// ── C++ ────────────────────────────────────────────────────────────────────
const cppRead = (t, v) => {
  switch (t) {
    case 'int': return `long long ${v}; cin >> ${v};`
    case 'bool': return `int ${v}_i; cin >> ${v}_i; bool ${v} = ${v}_i != 0;`
    case 'string': return `int ${v}_len; cin >> ${v}_len; cin.ignore(); string ${v}; getline(cin, ${v});`
    case 'int[]': return `int ${v}_n; cin >> ${v}_n; vector<long long> ${v}(${v}_n); for (int i = 0; i < ${v}_n; i++) cin >> ${v}[i];`
    case 'string[]': return `int ${v}_n; cin >> ${v}_n; vector<string> ${v}(${v}_n); for (int i = 0; i < ${v}_n; i++) { int L; cin >> L; cin.ignore(); getline(cin, ${v}[i]); }`
    case 'int[][]': return `int ${v}_r; cin >> ${v}_r; vector<vector<long long>> ${v}(${v}_r); for (int i = 0; i < ${v}_r; i++) { int c; cin >> c; ${v}[i].resize(c); for (int j = 0; j < c; j++) cin >> ${v}[i][j]; }`
    case 'string[][]': return `int ${v}_r; cin >> ${v}_r; vector<vector<string>> ${v}(${v}_r); for (int i = 0; i < ${v}_r; i++) { int c; cin >> c; ${v}[i].resize(c); for (int j = 0; j < c; j++) { int L; cin >> L; cin.ignore(); getline(cin, ${v}[i][j]); } }`
    default: throw new Error('cpp read ' + t)
  }
}
const cppWrite = (t) => {
  switch (t) {
    case 'int': return `cout << result << "\\n";`
    case 'bool': return `cout << (result ? 1 : 0) << "\\n";`
    case 'string': return `cout << result.size() << "\\n" << result << "\\n";`
    case 'int[]': return `cout << result.size() << "\\n"; for (size_t i = 0; i < result.size(); i++) cout << result[i] << (i + 1 == result.size() ? "" : " "); cout << "\\n";`
    case 'string[]': return `cout << result.size() << "\\n"; for (size_t i = 0; i < result.size(); i++) cout << result[i].size() << "\\n" << result[i] << "\\n";`
    case 'int[][]': return `cout << result.size() << "\\n"; for (auto& row : result) { cout << row.size() << "\\n"; for (size_t i = 0; i < row.size(); i++) cout << row[i] << (i + 1 == row.size() ? "" : " "); cout << "\\n"; }`
    default: throw new Error('cpp write ' + t)
  }
}

const HARNESS = {
  cpp: (sig, name, code) => `#include <bits/stdc++.h>
using namespace std;

${code}

int main() {
    ios::sync_with_stdio(false);
${sig.params.map((p) => '    ' + cppRead(p.type, p.name)).join('\n')}
    auto result = ${name}(${sig.params.map((p) => p.name).join(', ')});
    ${cppWrite(sig.returns)}
    return 0;
}
`,

  java: (sig, name, code) => `import java.util.*;
import java.io.*;

public class Main {
    static BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer st = new StringTokenizer("");
    static String token() throws IOException {
        while (!st.hasMoreTokens()) { String l = br.readLine(); if (l == null) return ""; st = new StringTokenizer(l); }
        return st.nextToken();
    }
    static String line() throws IOException {
        if (st.hasMoreTokens()) { StringBuilder sb = new StringBuilder();
            while (st.hasMoreTokens()) { sb.append(st.nextToken()); if (st.hasMoreTokens()) sb.append(' '); }
            return sb.toString(); }
        String l = br.readLine();
        return l == null ? "" : l;
    }
    static long num() throws IOException { return Long.parseLong(token()); }

${indent(code, 4)}

    public static void main(String[] args) throws IOException {
${sig.params.map((p) => indent(javaRead(p.type, p.name), 8)).join('\n')}
        ${javaType(sig.returns)} result = ${name}(${sig.params.map((p) => p.name).join(', ')});
${indent(javaWrite(sig.returns), 8)}
    }
}
`,

  csharp: (sig, name, code) => `using System;
using System.Collections.Generic;
using System.Linq;

public class Solution {
    static string[] buffer = new string[0];
    static int at = 0;
    static string Token() {
        while (at >= buffer.Length) { string l = Console.ReadLine(); if (l == null) return ""; buffer = l.Split(' ', StringSplitOptions.RemoveEmptyEntries); at = 0; if (buffer.Length == 0) return ""; }
        return buffer[at++];
    }
    static string Line() { if (at < buffer.Length) { var rest = string.Join(" ", buffer.Skip(at)); at = buffer.Length; return rest; } var l = Console.ReadLine(); return l ?? ""; }
    static long Num() { return long.Parse(Token()); }

${indent(code, 4)}

    public static void Main() {
${sig.params.map((p) => indent(csharpRead(p.type, p.name), 8)).join('\n')}
        var result = ${name}(${sig.params.map((p) => p.name).join(', ')});
${indent(csharpWrite(sig.returns), 8)}
    }
}
`,

  go: (sig, name, code) => `package main

import (
\t"bufio"
\t"fmt"
\t"os"
\t"strconv"
\t"strings"
)

var reader = bufio.NewReaderSize(os.Stdin, 1<<20)
var writer = bufio.NewWriter(os.Stdout)

func token() string {
\tvar s string
\tfmt.Fscan(reader, &s)
\treturn s
}
func num() int64 { v, _ := strconv.ParseInt(token(), 10, 64); return v }
func line() string { s, _ := reader.ReadString('\\n'); return strings.TrimRight(s, "\\r\\n") }

${code}

func main() {
\tdefer writer.Flush()
${sig.params.map((p) => '\t' + goRead(p.type, p.name)).join('\n')}
\tresult := ${name}(${sig.params.map((p) => p.name).join(', ')})
\t${goWrite(sig.returns)}
}
`,

  rust: (sig, name, code) => `use std::io::{self, Read, Write};

${code}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let mut lines = input.lines();
    let mut tokens: Vec<String> = Vec::new();
    let mut ti = 0usize;
    macro_rules! next_token { () => {{
        while ti >= tokens.len() {
            let l = lines.next().unwrap_or("");
            tokens = l.split_whitespace().map(|s| s.to_string()).collect();
            ti = 0;
            if tokens.is_empty() { break; }
        }
        let t = if ti < tokens.len() { tokens[ti].clone() } else { String::new() };
        ti += 1; t
    }}; }
    macro_rules! next_num { () => { next_token!().parse::<i64>().unwrap_or(0) }; }
    macro_rules! next_line { () => {{
        if ti < tokens.len() { let r = tokens[ti..].join(" "); ti = tokens.len(); r }
        else { lines.next().unwrap_or("").to_string() }
    }}; }
${sig.params.map((p) => '    ' + rustRead(p.type, p.name)).join('\n')}
    let result = ${name}(${sig.params.map((p) => p.name).join(', ')});
    let mut out = String::new();
${indent(rustWrite(sig.returns), 4)}
    io::stdout().write_all(out.as_bytes()).unwrap();
}
`,

  kotlin: (sig, name, code) => `import java.io.*
import java.util.*

private val br = BufferedReader(InputStreamReader(System.\`in\`))
private var st = StringTokenizer("")
private fun token(): String {
    while (!st.hasMoreTokens()) { val l = br.readLine() ?: return ""; st = StringTokenizer(l) }
    return st.nextToken()
}
private fun num(): Long = token().toLong()
private fun line(): String {
    if (st.hasMoreTokens()) { val sb = StringBuilder(); while (st.hasMoreTokens()) { sb.append(st.nextToken()); if (st.hasMoreTokens()) sb.append(' ') }; return sb.toString() }
    return br.readLine() ?: ""
}

${code}

fun main() {
${sig.params.map((p) => '    ' + kotlinRead(p.type, p.name)).join('\n')}
    val result = ${name}(${sig.params.map((p) => p.name).join(', ')})
    val sb = StringBuilder()
${indent(kotlinWrite(sig.returns), 4)}
    print(sb)
}
`,

  swift: (sig, name, code) => `import Foundation

var _tokens: [String] = []
var _ti = 0
func token() -> String {
    while _ti >= _tokens.count {
        guard let l = readLine(strippingNewline: true) else { return "" }
        _tokens = l.split(separator: " ").map(String.init)
        _ti = 0
        if _tokens.isEmpty { continue }
    }
    let t = _tokens[_ti]; _ti += 1; return t
}
func num() -> Int { return Int(token()) ?? 0 }
func line() -> String {
    if _ti < _tokens.count { let r = _tokens[_ti...].joined(separator: " "); _ti = _tokens.count; return r }
    return readLine(strippingNewline: true) ?? ""
}

${code}

${sig.params.map((p) => swiftRead(p.type, p.name)).join('\n')}
let result = ${name}(${sig.params.map((p) => p.name).join(', ')})
${swiftWrite(sig.returns)}
`,

  ruby: (sig, name, code) => `${code}

$tokens = []
def token
  while $tokens.empty?
    l = $stdin.gets
    return "" if l.nil?
    $tokens = l.split
  end
  $tokens.shift
end
def num; token.to_i; end
def line
  return $tokens.join(" ").tap { $tokens = [] } unless $tokens.empty?
  l = $stdin.gets
  l.nil? ? "" : l.chomp
end

${sig.params.map((p) => rubyRead(p.type, p.name)).join('\n')}
result = ${name}(${sig.params.map((p) => p.name).join(', ')})
${rubyWrite(sig.returns)}
`,

  typescript: (sig, name, code) => `${code}

const _data: string = require('fs').readFileSync(0, 'utf8')
const _lines: string[] = _data.split('\\n')
let _li = 0
let _tokens: string[] = []
let _ti = 0
function token(): string {
  while (_ti >= _tokens.length) {
    if (_li >= _lines.length) return ''
    _tokens = _lines[_li++].split(/\\s+/).filter((s) => s.length > 0)
    _ti = 0
  }
  return _tokens[_ti++]
}
function num(): number { return Number(token()) }
function line(): string {
  if (_ti < _tokens.length) { const r = _tokens.slice(_ti).join(' '); _ti = _tokens.length; return r }
  return _li < _lines.length ? _lines[_li++] : ''
}
${sig.params.map((p) => tsRead(p.type, p.name)).join('\n')}
const _result = ${name}(${sig.params.map((p) => p.name).join(', ')})
${tsWrite(sig.returns)}
`
}

// ── readers and writers ────────────────────────────────────────────────────
function javaType(t) {
  return { int: 'long', bool: 'boolean', string: 'String', 'int[]': 'long[]', 'string[]': 'String[]', 'int[][]': 'long[][]', 'string[][]': 'String[][]' }[t]
}
function javaRead(t, v) {
  switch (t) {
    case 'int': return `long ${v} = num();`
    case 'bool': return `boolean ${v} = num() != 0;`
    case 'string': return `int ${v}Len = (int) num();\nString ${v} = ${v}Len == 0 ? "" : line();`
    case 'int[]': return `int ${v}N = (int) num();\nlong[] ${v} = new long[${v}N];\nfor (int i = 0; i < ${v}N; i++) ${v}[i] = num();`
    case 'string[]': return `int ${v}N = (int) num();\nString[] ${v} = new String[${v}N];\nfor (int i = 0; i < ${v}N; i++) { int L = (int) num(); ${v}[i] = L == 0 ? "" : line(); }`
    case 'int[][]': return `int ${v}R = (int) num();\nlong[][] ${v} = new long[${v}R][];\nfor (int i = 0; i < ${v}R; i++) { int c = (int) num(); ${v}[i] = new long[c]; for (int j = 0; j < c; j++) ${v}[i][j] = num(); }`
    case 'string[][]': return `int ${v}R = (int) num();\nString[][] ${v} = new String[${v}R][];\nfor (int i = 0; i < ${v}R; i++) { int c = (int) num(); ${v}[i] = new String[c]; for (int j = 0; j < c; j++) { int L = (int) num(); ${v}[i][j] = L == 0 ? "" : line(); } }`
    default: throw new Error('java read ' + t)
  }
}
function javaWrite(t) {
  const sb = 'StringBuilder sb = new StringBuilder();'
  switch (t) {
    case 'int': return `System.out.println(result);`
    case 'bool': return `System.out.println(result ? 1 : 0);`
    case 'string': return `System.out.println(result.length());\nSystem.out.println(result);`
    case 'int[]': return `${sb}\nsb.append(result.length).append('\\n');\nfor (int i = 0; i < result.length; i++) { sb.append(result[i]); if (i + 1 < result.length) sb.append(' '); }\nsb.append('\\n');\nSystem.out.print(sb);`
    case 'string[]': return `${sb}\nsb.append(result.length).append('\\n');\nfor (String s : result) sb.append(s.length()).append('\\n').append(s).append('\\n');\nSystem.out.print(sb);`
    case 'int[][]': return `${sb}\nsb.append(result.length).append('\\n');\nfor (long[] row : result) { sb.append(row.length).append('\\n'); for (int i = 0; i < row.length; i++) { sb.append(row[i]); if (i + 1 < row.length) sb.append(' '); } sb.append('\\n'); }\nSystem.out.print(sb);`
    default: throw new Error('java write ' + t)
  }
}
function csharpRead(t, v) {
  switch (t) {
    case 'int': return `long ${v} = Num();`
    case 'bool': return `bool ${v} = Num() != 0;`
    case 'string': return `int ${v}Len = (int) Num();\nstring ${v} = ${v}Len == 0 ? "" : Line();`
    case 'int[]': return `int ${v}N = (int) Num();\nlong[] ${v} = new long[${v}N];\nfor (int i = 0; i < ${v}N; i++) ${v}[i] = Num();`
    case 'string[]': return `int ${v}N = (int) Num();\nstring[] ${v} = new string[${v}N];\nfor (int i = 0; i < ${v}N; i++) { int L = (int) Num(); ${v}[i] = L == 0 ? "" : Line(); }`
    case 'int[][]': return `int ${v}R = (int) Num();\nlong[][] ${v} = new long[${v}R][];\nfor (int i = 0; i < ${v}R; i++) { int c = (int) Num(); ${v}[i] = new long[c]; for (int j = 0; j < c; j++) ${v}[i][j] = Num(); }`
    case 'string[][]': return `int ${v}R = (int) Num();\nstring[][] ${v} = new string[${v}R][];\nfor (int i = 0; i < ${v}R; i++) { int c = (int) Num(); ${v}[i] = new string[c]; for (int j = 0; j < c; j++) { int L = (int) Num(); ${v}[i][j] = L == 0 ? "" : Line(); } }`
    default: throw new Error('csharp read ' + t)
  }
}
function csharpWrite(t) {
  switch (t) {
    case 'int': return `Console.WriteLine(result);`
    case 'string': return `Console.WriteLine(result.Length);\nConsole.WriteLine(result);`
    case 'bool': return `Console.WriteLine(result ? 1 : 0);`
    case 'int[]': return `Console.WriteLine(result.Length);\nConsole.WriteLine(string.Join(" ", result));`
    case 'string[]': return `Console.WriteLine(result.Length);\nforeach (var s in result) { Console.WriteLine(s.Length); Console.WriteLine(s); }`
    case 'int[][]': return `Console.WriteLine(result.Length);\nforeach (var row in result) { Console.WriteLine(row.Length); Console.WriteLine(string.Join(" ", row)); }`
    default: throw new Error('csharp write ' + t)
  }
}
function goRead(t, v) {
  switch (t) {
    case 'int': return `${v} := num()`
    case 'bool': return `${v} := num() != 0`
    case 'string': return `${v}Len := int(num())\n\t${v} := ""\n\tif ${v}Len > 0 { ${v} = line() } else { line() }`
    case 'int[]': return `${v}N := int(num())\n\t${v} := make([]int64, ${v}N)\n\tfor i := 0; i < ${v}N; i++ { ${v}[i] = num() }`
    case 'string[]': return `${v}N := int(num())\n\t${v} := make([]string, ${v}N)\n\tfor i := 0; i < ${v}N; i++ { L := int(num()); if L > 0 { ${v}[i] = line() } else { line() } }`
    case 'int[][]': return `${v}R := int(num())\n\t${v} := make([][]int64, ${v}R)\n\tfor i := 0; i < ${v}R; i++ { c := int(num()); ${v}[i] = make([]int64, c); for j := 0; j < c; j++ { ${v}[i][j] = num() } }`
    case 'string[][]': return `${v}R := int(num())\n\t${v} := make([][]string, ${v}R)\n\tfor i := 0; i < ${v}R; i++ { c := int(num()); ${v}[i] = make([]string, c); for j := 0; j < c; j++ { L := int(num()); if L > 0 { ${v}[i][j] = line() } else { line() } } }`
    default: throw new Error('go read ' + t)
  }
}
function goWrite(t) {
  switch (t) {
    case 'int': return `fmt.Fprintln(writer, result)`
    case 'string': return `fmt.Fprintln(writer, len(result))\n\tfmt.Fprintln(writer, result)`
    case 'bool': return `if result { fmt.Fprintln(writer, 1) } else { fmt.Fprintln(writer, 0) }`
    case 'int[]': return `fmt.Fprintln(writer, len(result))\n\tparts := make([]string, len(result))\n\tfor i, v := range result { parts[i] = strconv.FormatInt(v, 10) }\n\tfmt.Fprintln(writer, strings.Join(parts, " "))`
    case 'string[]': return `fmt.Fprintln(writer, len(result))\n\tfor _, s := range result { fmt.Fprintln(writer, len(s)); fmt.Fprintln(writer, s) }`
    case 'int[][]': return `fmt.Fprintln(writer, len(result))\n\tfor _, row := range result { fmt.Fprintln(writer, len(row)); parts := make([]string, len(row)); for i, v := range row { parts[i] = strconv.FormatInt(v, 10) }; fmt.Fprintln(writer, strings.Join(parts, " ")) }`
    default: throw new Error('go write ' + t)
  }
}
function rustRead(t, v) {
  switch (t) {
    case 'int': return `let ${v}: i64 = next_num!();`
    case 'bool': return `let ${v}: bool = next_num!() != 0;`
    case 'string': return `let ${v}_len = next_num!();\n    let ${v}: String = if ${v}_len > 0 { next_line!() } else { next_line!(); String::new() };`
    case 'int[]': return `let ${v}_n = next_num!() as usize;\n    let ${v}: Vec<i64> = (0..${v}_n).map(|_| next_num!()).collect();`
    case 'string[]': return `let ${v}_n = next_num!() as usize;\n    let ${v}: Vec<String> = (0..${v}_n).map(|_| { let l = next_num!(); if l > 0 { next_line!() } else { next_line!(); String::new() } }).collect();`
    case 'int[][]': return `let ${v}_r = next_num!() as usize;\n    let ${v}: Vec<Vec<i64>> = (0..${v}_r).map(|_| { let c = next_num!() as usize; (0..c).map(|_| next_num!()).collect() }).collect();`
    case 'string[][]': return `let ${v}_r = next_num!() as usize;\n    let ${v}: Vec<Vec<String>> = (0..${v}_r).map(|_| { let c = next_num!() as usize; (0..c).map(|_| { let l = next_num!(); if l > 0 { next_line!() } else { next_line!(); String::new() } }).collect() }).collect();`
    default: throw new Error('rust read ' + t)
  }
}
function rustWrite(t) {
  switch (t) {
    case 'int': return `out.push_str(&format!("{}\\n", result));`
    case 'string': return `out.push_str(&format!("{}\\n{}\\n", result.len(), result));`
    case 'bool': return `out.push_str(&format!("{}\\n", if result { 1 } else { 0 }));`
    case 'int[]': return `out.push_str(&format!("{}\\n", result.len()));\nout.push_str(&result.iter().map(|v| v.to_string()).collect::<Vec<_>>().join(" "));\nout.push('\\n');`
    case 'string[]': return `out.push_str(&format!("{}\\n", result.len()));\nfor s in &result { out.push_str(&format!("{}\\n", s.len())); out.push_str(s); out.push('\\n'); }`
    case 'int[][]': return `out.push_str(&format!("{}\\n", result.len()));\nfor row in &result { out.push_str(&format!("{}\\n", row.len())); out.push_str(&row.iter().map(|v| v.to_string()).collect::<Vec<_>>().join(" ")); out.push('\\n'); }`
    default: throw new Error('rust write ' + t)
  }
}
function kotlinRead(t, v) {
  switch (t) {
    case 'int': return `val ${v}: Long = num()`
    case 'bool': return `val ${v}: Boolean = num() != 0L`
    case 'string': return `val ${v}Len = num().toInt()\n    val ${v}: String = if (${v}Len > 0) line() else { line(); "" }`
    case 'int[]': return `val ${v}N = num().toInt()\n    val ${v} = LongArray(${v}N) { num() }`
    case 'string[]': return `val ${v}N = num().toInt()\n    val ${v} = Array(${v}N) { val L = num().toInt(); if (L > 0) line() else { line(); "" } }`
    case 'int[][]': return `val ${v}R = num().toInt()\n    val ${v} = Array(${v}R) { val c = num().toInt(); LongArray(c) { num() } }`
    case 'string[][]': return `val ${v}R = num().toInt()\n    val ${v} = Array(${v}R) { val c = num().toInt(); Array(c) { val L = num().toInt(); if (L > 0) line() else { line(); "" } } }`
    default: throw new Error('kotlin read ' + t)
  }
}
function kotlinWrite(t) {
  switch (t) {
    case 'int': return `sb.append(result).append('\\n')`
    case 'string': return `sb.append(result.length).append('\\n').append(result).append('\\n')`
    case 'bool': return `sb.append(if (result) 1 else 0).append('\\n')`
    case 'int[]': return `sb.append(result.size).append('\\n')\nsb.append(result.joinToString(" ")).append('\\n')`
    case 'string[]': return `sb.append(result.size).append('\\n')\nfor (s in result) sb.append(s.length).append('\\n').append(s).append('\\n')`
    case 'int[][]': return `sb.append(result.size).append('\\n')\nfor (row in result) { sb.append(row.size).append('\\n'); sb.append(row.joinToString(" ")).append('\\n') }`
    default: throw new Error('kotlin write ' + t)
  }
}
function swiftRead(t, v) {
  switch (t) {
    case 'int': return `let ${v} = num()`
    case 'bool': return `let ${v} = num() != 0`
    case 'string': return `let ${v}Len = num()\nlet ${v} = ${v}Len > 0 ? line() : { _ = line(); return "" }()`
    case 'int[]': return `let ${v}N = num()\nvar ${v} = [Int]()\nfor _ in 0..<${v}N { ${v}.append(num()) }`
    case 'string[]': return `let ${v}N = num()\nvar ${v} = [String]()\nfor _ in 0..<${v}N { let L = num(); ${v}.append(L > 0 ? line() : { _ = line(); return "" }()) }`
    case 'int[][]': return `let ${v}R = num()\nvar ${v} = [[Int]]()\nfor _ in 0..<${v}R { let c = num(); var row = [Int](); for _ in 0..<c { row.append(num()) }; ${v}.append(row) }`
    case 'string[][]': return `let ${v}R = num()\nvar ${v} = [[String]]()\nfor _ in 0..<${v}R { let c = num(); var row = [String](); for _ in 0..<c { let L = num(); row.append(L > 0 ? line() : { _ = line(); return "" }()) }; ${v}.append(row) }`
    default: throw new Error('swift read ' + t)
  }
}
function swiftWrite(t) {
  switch (t) {
    case 'int': return `print(result)`
    case 'string': return `print(result.count)\nprint(result)`
    case 'bool': return `print(result ? 1 : 0)`
    case 'int[]': return `print(result.count)\nprint(result.map { String($0) }.joined(separator: " "))`
    case 'string[]': return `print(result.count)\nfor s in result { print(s.count); print(s) }`
    case 'int[][]': return `print(result.count)\nfor row in result { print(row.count); print(row.map { String($0) }.joined(separator: " ")) }`
    default: throw new Error('swift write ' + t)
  }
}
function rubyRead(t, v) {
  switch (t) {
    case 'int': return `${v} = num`
    case 'bool': return `${v} = num != 0`
    case 'string': return `${v}_len = num\n${v} = ${v}_len > 0 ? line : (line; "")`
    case 'int[]': return `${v} = Array.new(num) { num }`
    case 'string[]': return `${v} = Array.new(num) { l = num; l > 0 ? line : (line; "") }`
    case 'int[][]': return `${v} = Array.new(num) { Array.new(num) { num } }`
    case 'string[][]': return `${v} = Array.new(num) { Array.new(num) { l = num; l > 0 ? line : (line; "") } }`
    default: throw new Error('ruby read ' + t)
  }
}
function rubyWrite(t) {
  switch (t) {
    case 'int': return `puts result`
    case 'string': return `puts result.length\nputs result`
    case 'bool': return `puts(result ? 1 : 0)`
    case 'int[]': return `puts result.length\nputs result.join(" ")`
    case 'string[]': return `puts result.length\nresult.each { |s| puts s.length; puts s }`
    case 'int[][]': return `puts result.length\nresult.each { |row| puts row.length; puts row.join(" ") }`
    default: throw new Error('ruby write ' + t)
  }
}
function tsRead(t, v) {
  switch (t) {
    case 'int': return `const ${v}: number = num()`
    case 'bool': return `const ${v}: boolean = num() !== 0`
    case 'string': return `const ${v}Len = num()\nconst ${v}: string = ${v}Len > 0 ? line() : (line(), '')`
    case 'int[]': return `const ${v}N = num()\nconst ${v}: number[] = []\nfor (let i = 0; i < ${v}N; i++) ${v}.push(num())`
    case 'string[]': return `const ${v}N = num()\nconst ${v}: string[] = []\nfor (let i = 0; i < ${v}N; i++) { const L = num(); ${v}.push(L > 0 ? line() : (line(), '')) }`
    case 'int[][]': return `const ${v}R = num()\nconst ${v}: number[][] = []\nfor (let i = 0; i < ${v}R; i++) { const c = num(); const row: number[] = []; for (let j = 0; j < c; j++) row.push(num()); ${v}.push(row) }`
    case 'string[][]': return `const ${v}R = num()\nconst ${v}: string[][] = []\nfor (let i = 0; i < ${v}R; i++) { const c = num(); const row: string[] = []; for (let j = 0; j < c; j++) { const L = num(); row.push(L > 0 ? line() : (line(), '')) }; ${v}.push(row) }`
    default: throw new Error('ts read ' + t)
  }
}
function tsWrite(t) {
  switch (t) {
    case 'int': return `console.log(String(_result))`
    case 'string': return `console.log(String(_result.length))\nconsole.log(_result)`
    case 'bool': return `console.log(_result ? '1' : '0')`
    case 'int[]': return `console.log(String(_result.length))\nconsole.log(_result.join(' '))`
    case 'string[]': return `console.log(String(_result.length))\nfor (const s of _result) { console.log(String(s.length)); console.log(s) }`
    case 'int[][]': return `console.log(String(_result.length))\nfor (const row of _result) { console.log(String(row.length)); console.log(row.join(' ')) }`
    default: throw new Error('ts write ' + t)
  }
}

function indent(text, n) {
  const pad = ' '.repeat(n)
  return text.split('\n').map((l) => (l.length ? pad + l : l)).join('\n')
}
