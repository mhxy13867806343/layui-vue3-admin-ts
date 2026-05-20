/**
 * Excel 工具
 *
 * - exportExcel(rows, columns, fileName)：根据列定义导出 .xlsx
 * - importExcel(file, schema)：解析上传文件，按 schema 校验并返回 rows + errors
 *
 * 依赖：`xlsx@^0.20.3`（已加入 package.json）
 */
import * as XLSX from 'xlsx'

export interface ExcelColumn {
  /** 列标题（中文表头） */
  title: string
  /** 数据 key */
  key: string
  /** 自定义渲染（仅导出时使用） */
  render?: (value: unknown, row: Record<string, unknown>) => unknown
}

export function exportExcel(
  rows: Record<string, unknown>[],
  columns: ExcelColumn[],
  fileName: string,
): void {
  const aoa: unknown[][] = []
  aoa.push(columns.map((c) => c.title))
  for (const row of rows) {
    aoa.push(
      columns.map((c) => {
        const raw = row[c.key]
        return c.render ? c.render(raw, row) : raw
      }),
    )
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  const finalName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`
  XLSX.writeFile(wb, finalName)
}

// ===== Import =====

export interface ImportFieldSchema<T = unknown> {
  /** 表头中文 */
  title: string
  /** 目标 key */
  key: string
  /** 是否必填 */
  required?: boolean
  /** 解析函数：把单元格 raw 转为目标类型；可在内部抛错由 importExcel 捕获 */
  transform?: (raw: unknown) => T
  /** 校验函数：返回 string 表示错误信息，返回 null/undefined 表示通过 */
  validate?: (value: T) => string | null | undefined
}

export interface ImportError {
  row: number
  column: string
  message: string
}

export interface ImportResult<T = Record<string, unknown>> {
  rows: T[]
  errors: ImportError[]
}

export async function importExcel<T extends Record<string, unknown> = Record<string, unknown>>(
  file: File,
  schema: ImportFieldSchema[],
): Promise<ImportResult<T>> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })
  const firstSheet = wb.Sheets[wb.SheetNames[0]]
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1, defval: '' })
  if (aoa.length === 0) return { rows: [], errors: [{ row: 0, column: '*', message: '工作表为空' }] }

  const header = (aoa[0] as unknown[]).map((c) => String(c ?? '').trim())
  const titleToIdx: Record<string, number> = {}
  header.forEach((title, i) => (titleToIdx[title] = i))

  const errors: ImportError[] = []
  const rows: T[] = []

  for (let i = 1; i < aoa.length; i++) {
    const arr = aoa[i] as unknown[]
    if (!arr || arr.length === 0) continue
    const obj = {} as Record<string, unknown>
    for (const field of schema) {
      const idx = titleToIdx[field.title]
      let raw: unknown = idx === undefined ? '' : arr[idx]
      if (raw === undefined || raw === null) raw = ''
      try {
        const value = field.transform ? field.transform(raw) : raw
        if (field.required && (value === '' || value === null || value === undefined)) {
          errors.push({ row: i + 1, column: field.title, message: '必填项缺失' })
          continue
        }
        if (field.validate) {
          const err = field.validate(value as never)
          if (err) errors.push({ row: i + 1, column: field.title, message: err })
        }
        obj[field.key] = value
      } catch (e) {
        const msg = e instanceof Error ? e.message : '解析失败'
        errors.push({ row: i + 1, column: field.title, message: msg })
      }
    }
    rows.push(obj as T)
  }

  return { rows, errors }
}
