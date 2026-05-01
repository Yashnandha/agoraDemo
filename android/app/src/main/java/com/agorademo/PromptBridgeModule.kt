package com.agorademo

import com.facebook.react.bridge.*

class PromptBridgeModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "PromptBridge"

    @ReactMethod
    fun generatePrompt(data: ReadableMap, promise: Promise) {
        try {
            val title = data.getString("title") ?: ""
            val description = data.getString("description") ?: ""
            val fieldsArray = data.getArray("fields")

            val fieldsList = mutableListOf<String>()

            if (fieldsArray != null) {
                for (i in 0 until fieldsArray.size()) {
                    fieldsList.add(fieldsArray.getString(i) ?: "")
                }
            }

            val prompt = buildPrompt(title, description, fieldsList)

            promise.resolve(prompt)

        } catch (e: Exception) {
            promise.reject("ERROR", e)
        }
    }

    // 🔥 Full prompt logic moved to native
    private fun buildPrompt(
        title: String,
        description: String,
        fields: List<String>
    ): String {

        val formattedFields = fields.mapIndexed { index, field ->
            "${index + 1}. ${capitalize(field)}"
        }.joinToString("\n")

        return """
You are an AI assistant.

Task:
Generate structured output.

Title:
$title

Description:
$description

Fields:
$formattedFields

Rules:
- Return JSON
- Clean format
- No extra explanation
        """.trimIndent()
    }

    private fun capitalize(str: String): String {
        return str.replaceFirstChar { it.uppercase() }
    }
}
