package com.example .shortmeal

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.Text
import androidx.compose.material3.Button
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import coil.compose.AsyncImage
import com.example.shortmeal.FoodPair
import com.example.shortmeal.Profilus
import com.example.shortmeal.Short_Meal_obj
import com.example.shortmeal.USR
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

data class Recipe(val title: String, val imageUrl: String, val id: String)
class Recepies : ComponentActivity() {
    var obj = Short_Meal_obj()

    @SuppressLint("SuspiciousIndentation")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val param = intent.getStringExtra("recepie")
        val usernamuss = intent.getStringExtra("username")
        lifecycleScope.launch {
            val recipes = param?.let { ingredient ->
                getRecipes(ingredient, this@Recepies)
            } ?: emptyList()

            // Now you can use the recipes list
            // For example, you can print it to the log
            Log.d("Recipes", recipes.joinToString())
            lifecycleScope.launch {
                val recipes = param?.let { ingredient ->
                    getRecipes(ingredient, this@Recepies)
                } ?: emptyList()
                setContent {
                    val navController = rememberNavController()
                    NavHost(navController, startDestination = "recipeList") {
                        composable("recipeList") {
                            LazyColumn(modifier = Modifier.fillMaxSize()) {
                                items(recipes) { recipe ->
                                    Column(modifier = Modifier.padding(16.dp)) {
                                        Text(recipe.title, color = Color.Black)
                                        Text("ID: ${recipe.id}", color = Color.Black)
                                        LoadImageFromUrl(recipe.imageUrl)
                                        Button(onClick = {
                                            lifecycleScope.launch {
                                                val nutritionAnalysis =
                                                    getNutritionAnalysis(recipe.id, this@Recepies)
                                                Log.d(
                                                    "Nutrition Analysis",
                                                    nutritionAnalysis.joinToString()
                                                )
                                                //Show each nutrient in a column who has a back button that destroy the column
                                                //and show the recipe again
                                                setContent {
                                                    if (usernamuss != null) {
                                                        ShowNutritionAnalysis(
                                                            nutritionAnalysis,
                                                            navController,
                                                            this@Recepies,
                                                            usernamus=usernamuss,
                                                            food=recipe.title,
                                                            img_url=recipe.imageUrl,
                                                            username = usernamuss
                                                        )
                                                    }else{
                                                        ShowNutritionAnalysis(
                                                            nutritionAnalysis,
                                                            navController,
                                                            this@Recepies,
                                                            usernamus="unknown",
                                                            food=recipe.title,
                                                            img_url=recipe.imageUrl,
                                                            username = usernamuss
                                                        )
                                                    }
                                                }
                                            }
                                        }) {
                                            Text("Nutrition Analysis")
                                        }
                                        //Add another button on the right
                                        Button(
                                            onClick = {
                                                getUserParameters(usernamuss!!,recipe.title,recipe.imageUrl)
                                                      },
                                            modifier = Modifier.align(Alignment.End)
                                        ) {
                                            Text(text = "Add ")
                                        }
                                    }
                                    //Log image URL
                                    Log.d("Image URL", recipe.imageUrl)
                                }
                            }
                            Box(modifier = Modifier.fillMaxSize()) {
                                Button(
                                    onClick = {

                                        val intent = Intent(this@Recepies, Profilus::class.java)
                                        intent.putExtra("username", usernamuss)
                                        this@Recepies.startActivity(intent)
                                    },
                                    modifier = Modifier.align(Alignment.TopEnd)
                                ) {
                                    Text("Back")
                                }
                            }
                        }
                    }

                }
            }
        }
    }
}
//5&apiKey=5df674c4fc0242e38d2d0dd5cd94ffac
suspend fun getRecipes(ingredient: String, context: Context): List<Recipe> = withContext(Dispatchers.IO) {
    val client = OkHttpClient()
    val request = Request.Builder()
        .url("https://api.spoonacular.com/recipes/findByIngredients?ingredients=$ingredient&number=5&apiKey=5df674c4fc0242e38d2d0dd5cd94ffac")
        .build()

    try {
        val response = client.newCall(request).execute()
        val body = response.body?.string()
        val jsonArray = JSONArray(body)
        val recipeList = mutableListOf<Recipe>()
        for (i in 0 until jsonArray.length()) {
            val jsonObject = jsonArray.getJSONObject(i)
            val recipe = jsonObject.getString("title")
            val imageUrl = jsonObject.getString("image")
            val id = jsonObject.getString("id")
            recipeList.add(Recipe(recipe, imageUrl, id))
        }

        recipeList
    } catch (e: IOException) {
        emptyList<Recipe>()
    }
}
@Composable
fun LoadImageFromUrl(url: String) {
    AsyncImage(
        model = url,
        contentDescription = "Translated description of what the image contains",
        modifier = Modifier
            .size(200.dp)
            .clip(CircleShape)
            .border(
                width = 2.dp,
                color = Color.Black,
                shape = CircleShape
            )
    )
}
//ake a function that call the api and get the nutrition analysis
suspend fun getNutritionAnalysis(recipeId: String, context: Context): List<Pair<String, String>> = withContext(Dispatchers.IO){
    val client = OkHttpClient()
    val request = Request.Builder()
            .url("https://api.spoonacular.com/recipes/$recipeId/nutritionWidget.json?apiKey=5df674c4fc0242e38d2d0dd5cd94ffac")
        .build()

    try {
        val response = client.newCall(request).execute()
        val body = response.body?.string()
        val jsonObject = JSONObject(body)
        val nutrientsArray = jsonObject.getJSONArray("nutrients")
        val recipeList = mutableListOf<Pair<String, String>>()

        for (i in 0 until nutrientsArray.length()) {
            val nutrientObject = nutrientsArray.getJSONObject(i)
            val nutrientName = nutrientObject.getString("name")
            var nutrientAmount = nutrientObject.getString("amount")
            nutrientAmount+=" "+nutrientObject.getString("unit")
            recipeList.add(Pair(nutrientName, nutrientAmount))
        }

        return@withContext recipeList
    } catch (e: IOException) {
        emptyList<Pair<String, String>>()
    }
}
@Composable
fun ShowNutritionAnalysis(nutritionAnalysis: List<Pair<String, String>>, navController: NavController,context: Context,usernamus:String,food:String,img_url: String,username:String?) {
    Column {
        for (nutrient in nutritionAnalysis) {
            Text("${nutrient.first}: ${nutrient.second}")
        }

        Button(onClick = {
     //Go to Show_recipe
            val intent = Intent(context, Profilus::class.java)
            intent.putExtra("username", username)
            context.startActivity(intent)

        }) {
            Text(text ="Back")
        }
        Button(onClick = {
           //Read from firebase Register/usernamer
            val onj = getUserParameters(usernamus,food,img_url)

        }) {
            Text(text = "Add ${usernamus} to your list")
        }
    }

}
fun getUserParameters(userName: String,foodus:String,img_url:String) {
    // Get a reference to the Firebase database
    val database = FirebaseDatabase.getInstance()

    // Get a reference to the "users" node
    val usersRef = database.getReference("Register")

    // Initialize a variable to hold the user data
    var user: USR? = null

    // Query the database for the user with the specified username
    val query = usersRef.orderByChild("username").equalTo(userName)
    query.addListenerForSingleValueEvent(object : ValueEventListener {
        override fun onDataChange(dataSnapshot: DataSnapshot) {
            if (dataSnapshot.exists()) {
                // The user exists in the database
                for (userSnapshot in dataSnapshot.children) {
                    // Get the user data and store it in the user variable
                   // user = userSnapshot.getValue(USR::class.java)
                     user = userSnapshot?.let {
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
                    var e=user?.list?.toMutableList()
                    if (e != null) {
                        e.add(FoodPair(foodus,img_url))
                    }
                    //remove first element
                    //Verify if the element on the position 0 of first is null
                    if (e != null) {
                        if (e[0].first=="null"){
                            e.removeAt(0)
                        }
                    }
                    Log.d("kilo", "Value is: ${e}")
                    //push e to the database
                    val userRef = usersRef.child(userName)
                    userRef.child("list").setValue(e)

                }
            }
        }

        override fun onCancelled(databaseError: DatabaseError) {
            // Handle possible errors.
        }
    })

    // Return the user data
}