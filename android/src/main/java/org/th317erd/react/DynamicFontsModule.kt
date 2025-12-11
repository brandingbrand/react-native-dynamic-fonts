package org.th317erd.react

import android.app.Activity
import android.graphics.Typeface
import android.util.Base64

import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.assets.ReactFontManager
import com.facebook.react.module.annotations.ReactModule
import java.io.File
import java.io.FileOutputStream

@ReactModule(name = DynamicFontsModule.NAME)
class DynamicFontsModule(reactContext: ReactApplicationContext) :
    NativeDynamicFontsSpec(reactContext) {

    override fun loadFontFromFile(options: ReadableMap, callback: Callback) {
        val currentActivity: Activity? = reactApplicationContext.currentActivity
        if (currentActivity == null) {
            callback.invoke("Invalid activity")
            return
        }

        val filePath: String? =
            if (options.hasKey("filePath")) options.getString("filePath") else null
        val name: String? = if ((options.hasKey("name"))) options.getString("name") else null

        if (name == null || name.isEmpty()) {
            callback.invoke("name property empty")
            return
        }

        if (filePath == null || filePath.isEmpty()) {
            callback.invoke("filePath property empty")
            return
        }

        val f = File(filePath)

        if (f.exists() && f.canRead()) {
            try {
                val typeface: Typeface = Typeface.createFromFile(f)
                //Cache the font for react
                ReactFontManager.getInstance().setTypeface(name, typeface.style, typeface)
                callback.invoke(null, name)
            } catch (e: Throwable) {
                callback.invoke(e.message)
            }
        } else {
            callback.invoke("invalid file")
        }
    }

    var tempNameCounter: Int = 0

    @Throws(Exception::class)
    override fun loadFont(options: ReadableMap, callback: Callback) {
        val currentActivity: Activity? = reactApplicationContext.currentActivity
        if (currentActivity == null) {
            callback.invoke("Invalid activity")
            return
        }

        var name: String? = if ((options.hasKey("name"))) options.getString("name") else null
        var data: String? = if ((options.hasKey("data"))) options.getString("data") else null
        var type: String? = null

        if (name == null || name.isEmpty()) {
            callback.invoke("Name property empty")
            return
        }

        if (data == null || data.isEmpty()) {
            callback.invoke("Data property empty")
            return
        }

        if (data.take(5).equals("data:", true)) {
            val pos: Int = data.indexOf(',')
            if (pos > 0) {
                val encodingParams: List<String> = data.substring(5, pos).split(";")
                val mimeType: String = encodingParams[0]

                data = data.substring(pos + 1)

                if (mimeType.equals("application/x-font-ttf", true) ||
                    mimeType.equals("application/x-font-truetype", true) ||
                    mimeType.equals("font/ttf", true)
                ) {
                    type = "ttf"
                } else if (mimeType.equals("application/x-font-opentype", true) ||
                    mimeType.equals("font/opentype", true)
                ) {
                    type = "otf"
                }
            }
        }

        if (options.hasKey("type")) type = options.getString("type")

        if (type == null) type = "ttf"

        try {
            val decodedBytes: ByteArray = Base64.decode(data, Base64.DEFAULT)
            val cacheFile = File(
                currentActivity.cacheDir,
                "tempFont" + (tempNameCounter++) + type
            )

            val stream = FileOutputStream(cacheFile)
            try {
                stream.write(decodedBytes)
            } finally {
                stream.close()
            }

            //Load the font from the temporary file we just created
            val typeface: Typeface = Typeface.createFromFile(cacheFile)

            if (typeface.isBold) name += "_bold"

            if (typeface.isItalic) name += "_italic"

            //Cache the font for react
            ReactFontManager.getInstance().setTypeface(name, typeface.style, typeface)

            cacheFile.delete()
            callback.invoke(null, name)
        } catch (e: Exception) {
            callback.invoke(e.message)
        }
    }

    companion object {
        const val NAME = "DynamicFonts"
    }
}
