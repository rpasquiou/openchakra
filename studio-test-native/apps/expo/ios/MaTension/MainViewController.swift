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

@objc class MainViewController: UIViewController {
    
    @IBOutlet var notificationLabel: UILabel!
    var csrfToken: String=""
    var accessToken: String=""

    @objc init(accessToken: String, csrfToken:String) {
      super.init(nibName:nil, bundle:nil)
      self.accessToken=accessToken
      self.csrfToken=csrfToken
    }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Sample app"
    }
    
    func getNavigationController() -> UIViewController? {
      return (UIApplication.shared.keyWindow?.rootViewController as? UIViewController)!
    }
      
    @objc func showWithingsDeviceSetup() {

      guard let urlRequest = installWithingsDeviceUrlRequest else { return }
      print("***** URL is \(urlRequest)")
      let customInstallViewController = CustomViewController(url: urlRequest,cookie: withingsDeviceSettingsCookie) { [weak self] notification in
          self?.notificationLabel.text = notification.description
          self?.navigationController?.popViewController(animated: true)
      }
      let controller = getNavigationController();
      controller?.present(customInstallViewController, animated:true);
    }
    
    @objc func showWithingsDeviceSettings() {
        guard let urlRequest = withingsDeviceSettingsUrlRequest else { return }
        let customInstallViewController = CustomViewController(url: urlRequest, cookie: withingsDeviceSettingsCookie) { [weak self] notification in
            self?.navigationController?.popViewController(animated: true)
        }
      let controller = getNavigationController();
      controller?.present(customInstallViewController, animated: true)
    }
    
    private var withingsDeviceSettingsCookie: HTTPCookie? {
        /*
            Here you should build your access token cookie which will be used to load the Withings Device Settings webview.
            Please refer to the documentation to get more info on how to do so.
        */
      let accessToken = self.accessToken
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
      guard let url = URL(string: "https://inappviews.withings.com/sdk/settings?csrf_token=\(self.csrfToken)") else {
            return nil
        }
        return URLRequest(url: url)
    }
    
    private var installWithingsDeviceUrlRequest: URLRequest? {
        /*
            Here you should set your backend URL which redirects to your Withings secured URL.
            Please refer to the documentation to get more info on how to do so.
        */
      guard let url = URL(string: "https://inappviews.withings.com/sdk/setup?&csrf_token=\(self.csrfToken)&device_model=45") else {
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
