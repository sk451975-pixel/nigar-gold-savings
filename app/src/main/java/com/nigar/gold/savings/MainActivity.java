package com.nigar.gold.savings;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();

        // Enable JavaScript
        settings.setJavaScriptEnabled(true);

        // Enable local storage
        settings.setDomStorageEnabled(true);

        // Enable database support
        settings.setDatabaseEnabled(true);

        // Allow local files
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        // Allow local HTML to access other local files
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);

        // Keep links inside the WebView
        webView.setWebViewClient(new WebViewClient());

        // Load the web application
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
