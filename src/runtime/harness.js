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
    int _T; cin >> _T;
    for (int _t = 0; _t < _T; _t++) {
${sig.params.map((p) => '        ' + cppRead(p.type, p.name)).join('\n')}
        auto result = ${name}(${sig.params.map((p) => p.name).join(', ')});
        ${cppWrite(sig.returns)}
    }
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
        int _T = (int) num();
        for (int _t = 0; _t < _T; _t++) {
${sig.params.map((p) => indent(javaRead(p.type, p.name), 12)).join('\n')}
            ${javaType(sig.returns)} result = ${name}(${sig.params.map((p) => p.name).join(', ')});
${indent(javaWrite(sig.returns), 12)}
        }
    }
}
`,

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

function indent(text, n) {
  const pad = ' '.repeat(n)
  return text.split('\n').map((l) => (l.length ? pad + l : l)).join('\n')
}