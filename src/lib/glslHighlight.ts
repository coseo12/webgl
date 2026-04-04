/**
 * GLSL 구문 하이라이팅 — 토큰 분류 및 CSS 클래스 매핑
 */

interface Token {
  text: string;
  className: string;
}

// GLSL 키워드/타입/내장함수 분류
const KEYWORDS = new Set([
  "attribute", "uniform", "varying", "const", "in", "out", "inout",
  "if", "else", "for", "while", "do", "break", "continue", "return", "discard",
  "struct", "void", "true", "false",
  "precision", "highp", "mediump", "lowp",
  "invariant", "flat", "smooth",
]);

const TYPES = new Set([
  "float", "int", "bool",
  "vec2", "vec3", "vec4",
  "ivec2", "ivec3", "ivec4",
  "bvec2", "bvec3", "bvec4",
  "mat2", "mat3", "mat4",
  "sampler2D", "samplerCube",
]);

const BUILTINS = new Set([
  "gl_Position", "gl_FragColor", "gl_FragCoord", "gl_PointSize", "gl_PointCoord",
  "gl_FrontFacing", "gl_FragData",
  // 자주 사용되는 내장 함수
  "radians", "degrees", "sin", "cos", "tan", "asin", "acos", "atan",
  "pow", "exp", "log", "exp2", "log2", "sqrt", "inversesqrt",
  "abs", "sign", "floor", "ceil", "fract", "mod", "min", "max", "clamp",
  "mix", "step", "smoothstep", "length", "distance", "dot", "cross",
  "normalize", "reflect", "refract", "texture2D", "textureCube",
  "matrixCompMult", "lessThan", "greaterThan", "equal", "notEqual",
  "any", "all", "not",
]);

// 토큰 패턴 (순서 중요: 먼저 매칭되는 것이 우선)
const TOKEN_REGEX =
  /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|(#\s*\w+)|(\b\d+\.\d*[eE][+-]?\d+|\b\d+\.\d*|\.\d+|\b\d+\b)|(\"[^\"]*\"|'[^']*')|([a-zA-Z_]\w*)|(\S)/g;

/**
 * GLSL 코드 한 줄을 토큰 배열로 변환
 */
export function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;

  TOKEN_REGEX.lastIndex = 0;
  let match;

  while ((match = TOKEN_REGEX.exec(line)) !== null) {
    // 매치 이전 공백 보존
    if (match.index > lastIndex) {
      tokens.push({
        text: line.slice(lastIndex, match.index),
        className: "",
      });
    }

    const text = match[0];
    let className = "text-gray-300"; // 기본: 일반 텍스트

    if (match[1] || match[2]) {
      // 주석 (한 줄 / 블록)
      className = "text-gray-500 italic";
    } else if (match[3]) {
      // 전처리기 지시자 (#version, #define 등)
      className = "text-purple-400";
    } else if (match[4]) {
      // 숫자 리터럴
      className = "text-orange-300";
    } else if (match[5]) {
      // 문자열
      className = "text-green-300";
    } else if (match[6]) {
      // 식별자 — 분류
      if (TYPES.has(text)) {
        className = "text-cyan-400";
      } else if (KEYWORDS.has(text)) {
        className = "text-pink-400";
      } else if (BUILTINS.has(text)) {
        className = "text-yellow-300";
      }
    }
    // match[7]: 기호 — 기본 색상 유지

    tokens.push({ text, className });
    lastIndex = TOKEN_REGEX.lastIndex;
  }

  // 남은 텍스트
  if (lastIndex < line.length) {
    tokens.push({
      text: line.slice(lastIndex),
      className: "",
    });
  }

  return tokens;
}
