import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    if Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil {
      FirebaseApp.configure()
    } else {
      // No real Firebase project configured — use placeholder options so the app
      // can still boot (e.g. on the simulator, where iOS push uses raw APNs and
      // FCM is never needed). Drop a real GoogleService-Info.plist into the
      // target to override this.
      let options = FirebaseOptions(
        googleAppID: "1:123456789012:ios:1234567890abcdef123456",
        gcmSenderID: "123456789012"
      )
      // Firebase requires the key to look real: "AIza" prefix, 39 chars.
      options.apiKey = "AIzaSyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
      options.projectID = "rn-push-example-placeholder"
      options.bundleID = Bundle.main.bundleIdentifier ?? "org.reactjs.native.example.RNPushExample"
      FirebaseApp.configure(options: options)
    }

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "RNPushExample",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
