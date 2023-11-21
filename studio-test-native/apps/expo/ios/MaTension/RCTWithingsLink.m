//
//  RCTWithingsLink.m
//  MaTension
//
//  Created by Wilfrid Albersdorfer on 21/11/2023.
//

#import <Foundation/Foundation.h>
#import <React/RCTLog.h>
// RCTWithingsLink.m
#import "RCTWithingsLink.h"

@implementation RCTWithingsLink

// accessToken: String, csrfToken: String
RCT_EXPORT_METHOD(openInstall:(NSString *)accessToken csrfToken:(NSString *)csrfToken)
{
 RCTLogInfo(@"HEP HEP HEP openIstall %@,%@", accessToken, csrfToken);
}

RCT_EXPORT_METHOD(openSettings:(NSString *)accessToken csrfToken:(NSString *)csrfToken)
{
 RCTLogInfo(@"openSettings %@,%@", accessToken, csrfToken);
}

RCT_EXPORT_MODULE(WithingsLink);

@end
