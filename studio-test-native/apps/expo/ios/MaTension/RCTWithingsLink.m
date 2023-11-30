//
//  RCTWithingsLink.m
//  MaTension
//
//  Created by Wilfrid Albersdorfer on 21/11/2023.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTRootView.h>
#import <React/RCTBridge.h>
#import <React/RCTLog.h>
// RCTWithingsLink.m
#import "RCTWithingsLink.h"

#import "MaTension-Swift.h"

@implementation RCTWithingsLink

// accessToken: String, csrfToken: String
RCT_EXPORT_METHOD(openInstall:(NSString *)accessToken csrfToken:(NSString *)csrfToken)
{
  RCTLogInfo(@"HEP HEP HEP openIstall %@,%@", accessToken, csrfToken);
  
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    dispatch_async(dispatch_get_main_queue(), ^(void) {
      MainViewController *mainViewController=[[MainViewController alloc] initWithAccessToken:accessToken csrfToken:csrfToken];
      [mainViewController showWithingsDeviceSetup];
    });
  });
}

RCT_EXPORT_METHOD(openSettings:(NSString *)accessToken csrfToken:(NSString *)csrfToken)
{
 RCTLogInfo(@"openSettings %@,%@", accessToken, csrfToken);
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    dispatch_async(dispatch_get_main_queue(), ^(void) {
      MainViewController *mainViewController=[[MainViewController alloc] initWithAccessToken:accessToken csrfToken:csrfToken];
      [mainViewController showWithingsDeviceSettings];
    });
  });
}

RCT_EXPORT_MODULE(WithingsLink);

@end
