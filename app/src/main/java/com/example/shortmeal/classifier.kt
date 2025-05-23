
import android.app.Activity
import android.content.Context
import android.graphics.Bitmap
import android.util.Log
import android.widget.Toast
import com.example.shortmeal.ml.Model
import org.tensorflow.lite.DataType
import org.tensorflow.lite.support.image.TensorImage
import org.tensorflow.lite.support.tensorbuffer.TensorBuffer
import java.io.BufferedReader
import java.io.InputStreamReader
import java.nio.ByteBuffer

class ImageClassifier( private val context: Context) {

 //   private val labels: List<String> = loadLabels() // Load the labels from a file or define them manually

 fun classify(bitmap: Bitmap):String {
    val model = Model.newInstance(context)

    // Creates inputs for reference.
    val inputFeature0 = TensorBuffer.createFixedSize(intArrayOf(1, 256, 256,3), DataType.FLOAT32)
    //Resize the bitmap
    //call the preprocces function
     val resizedBitmap = Bitmap.createScaledBitmap(bitmap, 256, 256, true)

     // Convert the image to TensorImage
     var tensorImage = TensorImage(DataType.FLOAT32)
     tensorImage.load(resizedBitmap)
     val byteBuffer: ByteBuffer = tensorImage.getBuffer()
    inputFeature0.loadBuffer(byteBuffer)
    //Log.d("kilo", "inputFeature0: ${inputFeature0.floatArray} ")
    // Runs model inference and gets result.
    val outputs = model.process(inputFeature0)
    val outputFeature0 = outputs.outputFeature0AsTensorBuffer

    // Releases model resources if no longer used.
    model.close()
     //Make an array with the classes
    // Postprocess the output
     //make an array with the labels
    val labels = listOf(
    "almonds",
    "apple",
    "avocado",
    "banana",
    "beer",
    "boisson-au-glucose-50g",
    "bread",
    "bread",
    "bread",
    "bread",
    "bread",
    "broccoli",
    "butter",
    "carrot",
    "cheese",
    "chicken",
    "chips-french-fries",
    "coffee-with-caffeine",
    "corn",
    "croissant",
    "cucumber",
    "dark-chocolate",
    "egg",
    "espresso-with-caffeine",
    "french-beans",
    "gruyere",
    "ham-raw",
    "hard-cheese",
    "honey",
    "jam",
    "leaf-spinach",
    "mandarine",
    "mayonnaise",
    "mixed-nuts",
    "mixed-salad-chopped-without-sauce",
    "mixed-vegetables",
    "onion",
    "parmesan",
    "pasta-spaghetti",
    "pickle",
    "pizza-margherita-baked",
    "potatoes-steamed",
    "rice",
    "salad-leaf-salad-green",
    "salami",
    "salmon",
    "sauce-savoury",
    "soft-cheese",
    "strawberries",
    "sweet-pepper",
    "tea",
    "tea-green",
    "tomato",
    "tomato-sauce",
    "water",
    "water-mineral",
    "white-coffee-with-caffeine",
    "wine-red",
    "wine-white",
    "zucchini"
)
     //show the position of the highest probability\
     val maxIndex = outputFeature0.floatArray.indices.maxByOrNull { outputFeature0.floatArray[it] } ?: -1
 //    Log.d("kilo", "Position with highest probability: $maxIndex")
//Make a toast to show the hightest posibility
     (context as Activity).runOnUiThread {
      //   Toast.makeText(context, "Label with highest probability: ${labels[maxIndex]}   ", Toast.LENGTH_SHORT).show()
     }
     return labels[maxIndex]
 }

}