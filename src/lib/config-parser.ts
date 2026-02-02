// Parser for BepInEx .cfg files

export type ConfigItemType = "boolean" | "select" | "text" | "number" | "multiselect"

export type ConfigItem = {
  key: string
  value: string
  type: ConfigItemType
  description?: string
  defaultValue?: string
  acceptableValues?: string[]
  settingType?: string
}

export type ConfigSection = {
  name: string
  displayName: string
  items: ConfigItem[]
}

export type ParsedConfig = {
  sections: ConfigSection[]
  rawText: string
}

/**
 * Parse BepInEx .cfg file into structured sections and items
 */
export function parseBepInExConfig(text: string): ParsedConfig {
  const lines = text.split('\n')
  const sections: ConfigSection[] = []
  let currentSection: ConfigSection | null = null
  let currentItemComments: string[] = []
  let currentItemMetadata: {
    settingType?: string
    defaultValue?: string
    acceptableValues?: string
  } = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Section header: [SectionName]
    if (line.startsWith('[') && line.endsWith(']')) {
      const sectionName = line.slice(1, -1)
      currentSection = {
        name: sectionName,
        displayName: sectionName.split('.').pop() || sectionName,
        items: []
      }
      sections.push(currentSection)
      currentItemComments = []
      currentItemMetadata = {}
      continue
    }

    // Description comment: ##
    if (line.startsWith('##')) {
      currentItemComments.push(line.slice(2).trim())
      continue
    }

    // Metadata comment: # Setting type:, # Default value:, # Acceptable values:
    if (line.startsWith('#')) {
      const metaLine = line.slice(1).trim()
      
      if (metaLine.startsWith('Setting type:')) {
        currentItemMetadata.settingType = metaLine.slice('Setting type:'.length).trim()
      } else if (metaLine.startsWith('Default value:')) {
        currentItemMetadata.defaultValue = metaLine.slice('Default value:'.length).trim()
      } else if (metaLine.startsWith('Acceptable values:')) {
        currentItemMetadata.acceptableValues = metaLine.slice('Acceptable values:'.length).trim()
      }
      continue
    }

    // Key = Value
    if (line.includes('=') && currentSection) {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').trim()
      
      const item: ConfigItem = {
        key: key.trim(),
        value,
        type: inferType(currentItemMetadata.settingType, currentItemMetadata.acceptableValues),
        description: currentItemComments.join(' '),
        settingType: currentItemMetadata.settingType,
        defaultValue: currentItemMetadata.defaultValue,
      }

      // Parse acceptable values if present
      if (currentItemMetadata.acceptableValues) {
        item.acceptableValues = currentItemMetadata.acceptableValues
          .split(',')
          .map(v => v.trim())
      }

      currentSection.items.push(item)
      
      // Reset for next item
      currentItemComments = []
      currentItemMetadata = {}
      continue
    }

    // Empty line or other comment - reset metadata if no key follows
    if (line === '' || line.startsWith('#')) {
      // Keep accumulating until we hit a key=value
      continue
    }
  }

  return { sections, rawText: text }
}

/**
 * Infer control type from metadata
 */
function inferType(settingType?: string, acceptableValues?: string): ConfigItemType {
  if (!settingType) return "text"
  
  const lower = settingType.toLowerCase()
  
  if (lower === "boolean") return "boolean"
  if (acceptableValues) {
    // Check if multiple values notation present
    if (acceptableValues.toLowerCase().includes('multiple values')) {
      return "multiselect"
    }
    return "select"
  }
  if (lower.includes("int") || lower.includes("float") || lower.includes("double")) {
    return "number"
  }
  
  return "text"
}

/**
 * Update a config item value in the raw text
 * This preserves formatting and comments
 */
export function updateConfigValue(rawText: string, sectionName: string, key: string, newValue: string): string {
  const lines = rawText.split('\n')
  let inTargetSection = false
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Check if entering target section
    if (trimmed === `[${sectionName}]`) {
      inTargetSection = true
      result.push(line)
      continue
    }

    // Check if entering different section
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      inTargetSection = false
      result.push(line)
      continue
    }

    // If in target section and this is our key
    if (inTargetSection && trimmed.includes('=')) {
      const [lineKey] = trimmed.split('=')
      if (lineKey.trim() === key) {
        // Replace the value, preserving indentation
        const indent = line.match(/^\s*/)?.[0] || ''
        result.push(`${indent}${key} = ${newValue}`)
        continue
      }
    }

    result.push(line)
  }

  return result.join('\n')
}

/**
 * Parse standard .ini file into structured sections and items
 * Standard INI format:
 * [Section]
 * key=value
 * ; comment
 * # comment
 */
export function parseIniConfig(text: string): ParsedConfig {
  const lines = text.split('\n')
  const sections: ConfigSection[] = []
  let currentSection: ConfigSection | null = null
  let currentItemComments: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip empty lines
    if (trimmed === '') {
      continue
    }

    // Section header: [SectionName]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const sectionName = trimmed.slice(1, -1)
      currentSection = {
        name: sectionName,
        displayName: sectionName,
        items: []
      }
      sections.push(currentSection)
      currentItemComments = []
      continue
    }

    // Comment lines: ; or #
    if (trimmed.startsWith(';') || trimmed.startsWith('#')) {
      const comment = trimmed.startsWith(';') 
        ? trimmed.slice(1).trim()
        : trimmed.slice(1).trim()
      currentItemComments.push(comment)
      continue
    }

    // Key = Value or Key: Value
    if ((trimmed.includes('=') || trimmed.includes(':')) && currentSection) {
      const separator = trimmed.includes('=') ? '=' : ':'
      const [key, ...valueParts] = trimmed.split(separator)
      const value = valueParts.join(separator).trim()
      
      const item: ConfigItem = {
        key: key.trim(),
        value,
        type: inferIniType(value),
        description: currentItemComments.join(' '),
      }

      currentSection.items.push(item)
      
      // Reset for next item
      currentItemComments = []
      continue
    }
  }

  return { sections, rawText: text }
}

/**
 * Infer control type from INI value
 * Since INI files don't have type metadata, we infer from the value
 */
function inferIniType(value: string): ConfigItemType {
  const lower = value.toLowerCase().trim()
  
  // Boolean check
  if (lower === "true" || lower === "false" || lower === "yes" || lower === "no" || 
      lower === "on" || lower === "off" || lower === "1" || lower === "0") {
    return "boolean"
  }
  
  // Number check
  if (/^-?\d+(\.\d+)?$/.test(value.trim())) {
    return "number"
  }
  
  return "text"
}

/**
 * Update an INI config item value in the raw text
 * This preserves formatting and comments
 */
export function updateIniValue(rawText: string, sectionName: string, key: string, newValue: string): string {
  const lines = rawText.split('\n')
  let inTargetSection = false
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Check if entering target section
    if (trimmed === `[${sectionName}]`) {
      inTargetSection = true
      result.push(line)
      continue
    }

    // Check if entering different section
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      inTargetSection = false
      result.push(line)
      continue
    }

    // If in target section and this is our key
    if (inTargetSection && (trimmed.includes('=') || trimmed.includes(':'))) {
      const separator = trimmed.includes('=') ? '=' : ':'
      const [lineKey] = trimmed.split(separator)
      if (lineKey.trim() === key) {
        // Replace the value, preserving indentation and separator
        const indent = line.match(/^\s*/)?.[0] || ''
        result.push(`${indent}${key}${separator}${newValue}`)
        continue
      }
    }

    result.push(line)
  }

  return result.join('\n')
}
