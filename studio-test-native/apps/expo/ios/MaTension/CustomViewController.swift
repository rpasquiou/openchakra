//
//  CustomViewController.swift
//  WithingsSdkSampleApp
//
//  Created by Withings on 25/06/2020.
//  Copyright © 2020 Withings. All rights reserved.
//

import Foundation
import UIKit
import WebKit
import Withings

class CustomViewController: UIViewController, UISearchBarDelegate {

    @objc private lazy var webview: WithingsWebView = createWebview()

    private let url: URLRequest
    private let cookie: HTTPCookie?
    private let notificationCallback: ((WithingsWebViewNotification) -> Void)
    
    init(url: URLRequest, cookie: HTTPCookie? = nil, notificationCallback: @escaping ((WithingsWebViewNotification) -> Void)) {
        self.url = url
        self.cookie = cookie
        self.notificationCallback = notificationCallback
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    //MARK: - View lifecycle

    override func loadView() {
        super.loadView()
        buildViewHierarchy()
        setConstraints()
        loadCookieAndUrl()
    }

    //MARK: - WKWebView canGoBack observer
    
    @objc private func canGoBackHasChanged() {
        let canGoBack = webview.canGoBack
        navigationController?.interactivePopGestureRecognizer?.isEnabled = !canGoBack
    }
    
    //MARK: - View layout
    
    private func buildViewHierarchy() {
        view.addSubview(webview)
    }
    
    private func setConstraints() {
        NSLayoutConstraint.activate([
            webview.topAnchor.constraint(equalTo: view.topAnchor, constant: 0),
            webview.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: 0),
            webview.leftAnchor.constraint(equalTo: view.leftAnchor, constant: 0),
            webview.rightAnchor.constraint(equalTo: view.rightAnchor, constant: 0)
        ])
    }
    
    // MARK: - Webview helper
    
    private func loadCookieAndUrl() {
        cleanCacheAndCookies()
        if let cookie = cookie {
            webview.configuration.websiteDataStore.httpCookieStore.setCookie(cookie) { [weak self] in
                self?.loadUrl()
            }
        } else {
            loadUrl()
        }
    }
    
    private func loadUrl() {
        webview.load(url)
    }
    
    private func cleanCacheAndCookies() {
        HTTPCookieStorage.shared.removeCookies(since: Date(timeIntervalSince1970: 0))
        let websiteDataTypes = NSSet(array: [WKWebsiteDataTypeDiskCache, WKWebsiteDataTypeMemoryCache])
        WKWebsiteDataStore.default().removeData(ofTypes: websiteDataTypes as! Set<String>, modifiedSince: Date(timeIntervalSince1970: 0), completionHandler:{ })
    }

}

//MARK: - Subviews init

private extension CustomViewController {
    func createWebview() -> WithingsWebView {
        let configuration = WKWebViewConfiguration()
        let webview = WithingsWebView(frame: .zero, configuration: configuration, notificationCallback: notificationCallback)
        webview.translatesAutoresizingMaskIntoConstraints = false
        webview.allowsBackForwardNavigationGestures = true
        return webview
    }
}
