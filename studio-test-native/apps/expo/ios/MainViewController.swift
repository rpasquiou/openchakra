//
//  MainViewController.swift
//  SdkSampleApp
//
//  Created by Withings on 27/02/2020.
//  Copyright © 2020 Withings. All rights reserved.
//

import Foundation
import UIKit
import Withings
import WebKit

class MainViewController: UIViewController {
    
    @IBOutlet var notificationLabel: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Sample app"
        notificationLabel.text = ""
    }
    
    @IBAction func customInstallWithingsDevice(_ sender: Any) {
        notificationLabel.text = ""
        guard let urlRequest = installWithingsDeviceUrlRequest else { return }
        let customInstallViewController = CustomViewController(url: urlRequest) { [weak self] notification in
            self?.notificationLabel.text = notification.description
            self?.navigationController?.popViewController(animated: true)
        }
        navigationController?.pushViewController(customInstallViewController, animated: true)
    }
    
    @IBAction func showWithingsDeviceSettings() {
        guard let urlRequest = withingsDeviceSettingsUrlRequest else { return }
        let customInstallViewController = CustomViewController(url: urlRequest, cookie: withingsDeviceSettingsCookie) { [weak self] notification in
            self?.notificationLabel.text = notification.description
            self?.navigationController?.popViewController(animated: true)
        }
        navigationController?.pushViewController(customInstallViewController, animated: true)
    }
    
    private var withingsDeviceSettingsCookie: HTTPCookie? {
        /*
            Here you should build your access token cookie which will be used to load the Withings Device Settings webview.
            Please refer to the documentation to get more info on how to do so.
        */
        let accessToken = "YOUR_ACCESS_TOKEN"
        return HTTPCookie(properties: [
            .domain: ".withings.com",
            .path: "/",
            .name: "access_token",
            .value: accessToken,
            .secure: "TRUE",
            .expires: NSDate(timeIntervalSinceNow: 10_800)
        ])
    }
    
    private var withingsDeviceSettingsUrlRequest: URLRequest? {
        /*
            Here you should build the "Withings Device Settings" URL with your consumer ID
            and CSRF token.
            Please refer to the documentation to get more info on how to do so.
        */
        guard let url = URL(string: "https://inappviews.withings.com/sdk/settings?consumer={YOUR_CONSUMER_ID}&csrf_token={YOUR_CSRF_TOKEN}") else {
            return nil
        }
        return URLRequest(url: url)
    }
    
    private var installWithingsDeviceUrlRequest: URLRequest? {
        /*
            Here you should set your backend URL which redirects to your Withings secured URL.
            Please refer to the documentation to get more info on how to do so.
        */
        guard let url = URL(string: "https://mybackend.redirect.to.withings.url.com") else {
            return nil
        }
        return URLRequest(url: url)
    }
    
}

extension WithingsWebViewNotification {
    var description: String {
        return "Notification type = \(type)\nNotification params = \(parameters)"
    }
    
}
