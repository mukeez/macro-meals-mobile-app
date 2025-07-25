# Keep required classes
-keep class androidx.camera.extensions.** { *; }
-keep class androidx.work.** { *; }
-keep class com.stripe.android.** { *; }
-keep class com.reactnativestripesdk.** { *; }

# Ignore warnings for unused Stripe Push Provisioning classes
-dontwarn com.stripe.android.pushProvisioning.**
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivity$g
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivityStarter$Args
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivityStarter$Error
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivityStarter
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningEphemeralKeyProvider
-dontwarn com.stripe.android.pushProvisioning.EphemeralKeyUpdateListener

-dontwarn com.jwplayer.**
-dontwarn com.google.android.gms.cast.framework.**
-dontwarn kotlinx.parcelize.Parcelize

# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.swmansion.reanimated.** { *; }

# Keep your application classes
-keep class com.macromeals.app.** { *; }

# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

-printconfiguration proguard-merged-config.txt

# End of content from /Users/leandro/Downloads/StripeR8Warnings/app/proguard-rules.pro
# The proguard configuration file for the following section is /Users/leandro/Downloads/StripeR8Warnings/app/build/intermediates/aapt_proguard_file/release/aapt_rules.txt


# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep Javascript interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Remove logging
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Keep Stripe related classes
