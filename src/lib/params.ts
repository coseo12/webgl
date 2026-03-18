export interface SliderParam {
  type: "slider";
  label: string;
  key: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface ColorParam {
  type: "color";
  label: string;
  key: string;
  defaultValue: string;
}

export interface CheckboxParam {
  type: "checkbox";
  label: string;
  key: string;
  defaultValue: boolean;
}

export interface SelectParam {
  type: "select";
  label: string;
  key: string;
  options: { label: string; value: string }[];
  defaultValue: string;
}

export type Param = SliderParam | ColorParam | CheckboxParam | SelectParam;

export type ParamValues = Record<string, number | string | boolean>;

export function getDefaultValues(params: Param[]): ParamValues {
  const values: ParamValues = {};
  for (const p of params) {
    values[p.key] = p.defaultValue;
  }
  return values;
}
