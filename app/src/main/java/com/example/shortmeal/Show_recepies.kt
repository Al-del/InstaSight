package com.example.shortmeal

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.LifecycleCoroutineScope
import androidx.lifecycle.lifecycleScope
import com.example.shortmeal.ui.theme.SHORTMealTheme
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine

class Show_recpie(){
    var ingredients: List<String>? = null
    var title: String? = null
    var image: String? = null
    var video: String? = null
    var instructions: String? = null
}
class Show_recepies : ComponentActivity() {
    private val foodListState = mutableStateOf<List<FoodPair>?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val username= intent.getStringExtra("username")
        setContent {
            SHORTMealTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    foodListState.value?.let { FoodList(it,lifecycleScope, context = this@Show_recepies) }
                }
            }
        }

        lifecycleScope.launch {
            val list = get_list_of_foods(username.toString())
            // Update the state with the loaded list
            foodListState.value = list
        }
    }
}
suspend fun get_list_of_foods(userName: String): MutableList<FoodPair>? = suspendCoroutine { continuation ->
    // Get a reference to the Firebase database
    val database = FirebaseDatabase.getInstance()

    // Get a reference to the "users" node
    val usersRef = database.getReference("Register")

    // Query the database for the user with the specified username
    val query = usersRef.orderByChild("username").equalTo(userName)
    query.addListenerForSingleValueEvent(object : ValueEventListener {
        override fun onDataChange(dataSnapshot: DataSnapshot) {
            if (dataSnapshot.exists()) {
                // The user exists in the database
                for (userSnapshot in dataSnapshot.children) {
                    // Get the user data and store it in the user variable
                    //val user = userSnapshot.getValue(USR::class.java)
                    val user = userSnapshot?.let {
                        val username = it.child("username").getValue(String::class.java) ?: ""
                        val password = it.child("password").getValue(String::class.java) ?: ""
                        val listSnapshot = it.child("list")
                        val list = mutableListOf<FoodPair>()
                        for (pairSnapshot in listSnapshot.children) {
                            val first = pairSnapshot.child("first").getValue(String::class.java) ?: ""
                            val second = pairSnapshot.child("second").getValue(String::class.java) ?: ""
                            list.add(FoodPair(first, second))
                        }
                        USR(username, password, list)
                    }
                    Log.d("kilo", "Value is: ${user?.list}")
                    var e:List<FoodPair>?
                    e=user?.list
                    Log.d("kilo", "Value is: ${e}")
                    continuation.resume(e as MutableList<FoodPair>?)
                }
            } else {
                continuation.resume(null)
            }
        }

        override fun onCancelled(databaseError: DatabaseError) {
            // Handle possible errors.
            continuation.resumeWithException(databaseError.toException())
        }
    })
}
@Composable
fun FoodList(foodList: List<FoodPair>, lifecycleScope: LifecycleCoroutineScope,context: Context) {

    LazyColumn {
        items(foodList) { item ->
            Card(modifier = Modifier.padding(8.dp)) {
                Text(text = "${item.first}", modifier = Modifier
                    .padding(8.dp)
                    .clickable {
                        lifecycleScope.launch {
                            val recipeUrl = withContext(Dispatchers.IO) {
                                getEdamamRecipes(
                                    "eaa2c4366d4e55b3088a580edfaa5bd7",
                                    "179c5048",
                                    item.first
                                )
                            }
                            val obj_d=  withContext(Dispatchers.IO) {
                                getSpoonacularRecipes(
                                    "5df674c4fc0242e38d2d0dd5cd94ffac",
                                    recipeUrl.toString(),
                                    recepie_Name = item.first
                                )
                            }
                            Log.d("kilo", "obj_d is: ${obj_d.title.toString()}")
                            val intent = Intent(context, Recepie_idk::class.java)
                            intent.putExtra("title",obj_d.title)
                            intent.putExtra("image",obj_d.image)
                            intent.putExtra("ingredients",obj_d.ingredients.toString())
                            intent.putExtra("video",obj_d.video)
                            intent.putExtra("instrutions",obj_d.instructions)
                            context.startActivity(intent)
                        }
                    }, style = MaterialTheme.typography.displayMedium)
                LoadImageFromUrl(url = item.second)
            }
        }
    }

}

suspend fun getEdamamRecipes(apiKey: String, appId: String, food: String, numResults: Int = 5): String? {
    val baseUrl = "https://api.edamam.com/search"

    val client = OkHttpClient()

    // Set up parameters for the API request
    val url = "$baseUrl?q=$food&app_id=$appId&app_key=$apiKey&to=$numResults"

    // Make the API request
    val request = Request.Builder()
        .url(url)
        .build()

    val response = client.newCall(request).execute()

    // Transform the response into a JSON
    val jsonData = JSONObject(response.body?.string())

    // Get the recipe URL
    val hits = jsonData.getJSONArray("hits")
    if (hits.length() > 0) {
        val firstHit = hits.getJSONObject(0)
        val recipe = firstHit.getJSONObject("recipe")
        val recipeUrl = recipe.getString("url")

        return recipeUrl
    } else {
        return null  // No recipes found for the specified food
    }
}
suspend fun getSpoonacularRecipes(apiKey: String, urlus: String, numResults: Int = 5,recepie_Name: String?): Show_recpie {
    val baseUrl = "https://api.spoonacular.com/recipes/extract"

    val client = OkHttpClient()

    // Set up parameters for the API request
    val url = "$baseUrl?url=$urlus&apiKey=$apiKey"

    // Make the API request
    val request = Request.Builder()
        .url(url)
        .build()

    val response = client.newCall(request).execute()
    //Log.d("kilo", "Response is: ${response.body?.string()}")
    // Transform the response into a JSON
    var responseBody: String? = null

    try {
        responseBody = response.body?.string()
    } catch (e: Exception) {
        // Handle the exception
        e.printStackTrace()
    } finally {
        response.body?.close()
    }
    Log.d("kilo", "Response is: $responseBody")
    val jsonData = responseBody?.let { JSONObject(it) }
    //show them into some texts
    // Get the recipe URL
    try {


        val title = jsonData?.getString("title")
        val image = jsonData?.getString("image")
        val ingredients = jsonData?.getJSONArray("extendedIngredients")
        val ingredients_list = mutableListOf<String>()
        if (ingredients != null) {
            for (i in 0 until ingredients.length()) {
                val ingredient = ingredients.getJSONObject(i)
                val name = ingredient.getString("name")
                ingredients_list.add(name)
            }
        }
        val instructions = jsonData?.getString("instructions")
        Log.d("kilo", "Title is: $title")
        Log.d("kilo", "Image is: $image")
        Log.d("kilo", "Instructions are: $instructions")
        Log.d("kilo", "Ingredients are: $ingredients")
        val recipe = Show_recpie()
        recipe.title = title
        recipe.image = image
        recipe.ingredients = ingredients_list
        recipe.instructions = instructions
        /* TO DO  get a video*/
        // Return the response as a string
        val a = recepie_Name?.let { getSpoonacularRecipeVideo(apiKey, it) }
        recipe.video=a
        Log.d("kilo", "Response is: ${a}")
        return recipe
//    return response.body?.string()
    }catch (e: Exception) {
        // Handle the exception
        e.printStackTrace()
        Log.d("kilo", "Response is: ${e}")
        return Show_recpie()
    }
}
suspend fun getSpoonacularRecipeVideo(apiKey: String, recipeName: String): String? {
    try {
        val baseUrl = "https://api.spoonacular.com/food/videos/search"

        val client = OkHttpClient()

        // Set up parameters for the API request
        val url = "$baseUrl?query=$recipeName&apiKey=$apiKey"

        // Make the API request
        val request = Request.Builder()
            .url(url)
            .build()

        val response = client.newCall(request).execute()

        // Transform the response into a JSON
        val jsonData = JSONObject(response.body?.string())
        Log.d("kilo", "Response is: ${jsonData} ${recipeName}")
        // Get the video URL
        val videos = jsonData.getJSONArray("videos")
        if (videos.length() > 0) {
            val firstVideo = videos.getJSONObject(0)
            val videoUrl = firstVideo.getString("youTubeId")

            return "https://www.youtube.com/watch?v=$videoUrl"
        } else {
            return null  // No videos found for the specified recipe
        }
    }catch (e: Exception) {
        // Handle the exception
        e.printStackTrace()
        return null
    }
}