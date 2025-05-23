package com.example.shortmeal

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.compose.rememberNavController
import com.example.shortmeal.ui.theme.SHORTMealTheme
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.DrawerValue
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import coil.compose.rememberImagePainter
import kotlinx.coroutines.launch
import java.io.File
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import androidx.navigation.compose.rememberNavController
class Profilus : ComponentActivity() {
    var obj=Short_Meal_obj()
    var a = profil()

    //
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val user_name= intent.getStringExtra("username")
        setContent {
            SHORTMealTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize()
                    ) {
                        HeaderView()
                        // Conținut principal
                        Column(
                            modifier = Modifier
                                .weight(1f) // Umple spațiul disponibil
                                .fillMaxWidth()
                        ) {
                            a.scor = 100
                            a.name = user_name.toString()
                            a.posts = 10
                            a.imagine = R.drawable.cuza
                            obj.profilepage(a, navController = rememberNavController())
                        }

                        // Footer-ul
                        FooterView()
                    }
                }

                // Drawer (dacă e cazul)
                if (user_name != null) {
                    obj.ModalDrawerExample(
                        context = this@Profilus,
                        navController = rememberNavController(),
                        username = user_name.toString(),
                        activityContentScope = { state, scope ->
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalAlignment = Alignment.End
                            ) {
                                BackHandler(
                                    enabled = state.currentValue != DrawerValue.Open,
                                    onBack = {
                                        scope.launch {
                                            if (state.currentValue == DrawerValue.Open) {
                                                state.close()
                                            } else {
                                                state.open()
                                            }
                                        }
                                    }
                                )
                            }
                        }
                    )
                }
            }
        }
    }
    @Composable
    fun FooterView() {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.primary)
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "© 2025 InstaSight. Toate drepturile rezervate.",
                color = Color.White,
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
    @Composable
    fun HeaderView() {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.primary)
                .padding(16.dp),
            contentAlignment = Alignment.CenterStart
        ) {
            Text(
                text = "Profilul utilizatorului",
                color = Color.White,
                style = MaterialTheme.typography.titleMedium
            )
        }
    }

}