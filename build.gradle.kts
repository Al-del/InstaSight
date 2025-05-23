buildscript {
    repositories {
       maven("https://chaquo.com/maven")
    }
    dependencies {
        classpath(libs.google.services)
        classpath("com.chaquo.python:gradle:7.0.2")
    }
}
// Top-level build file where you can add configuration options common to all sub-projects/modules.
@Suppress("DSL_SCOPE_VIOLATION") // TODO: Remove once KTIJ-19369 is fixed
plugins {
    alias(libs.plugins.androidApplication) apply false
    alias(libs.plugins.kotlinAndroid) apply false
    id("com.google.gms.google-services") version "4.4.1" apply false
}
true // Needed to make the Suppress annotation work for the plugins block