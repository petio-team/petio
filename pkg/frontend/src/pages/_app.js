import "../styles/global/main.scss";
import notifications from "../styles/components/notifications.module.scss";
import "react-toastify/dist/ReactToastify.css";

import smoothscroll from "smoothscroll-polyfill";
import { useLocation, withRouter, useHistory } from "react-router-dom";

import { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import { Switch, Route } from "react-router-dom";

import Layout from "../components/layout";
import { Login } from "../components/login";
import { Loading } from "../components/loading";
import Notification from "../components/notification";
import Setup from "./setup";

import { checkConfig } from "../services/config.service";
import {
  clearToken,
  getToken,
  login,
  getRequests,
} from "../services/user.service";

import { connect } from "react-redux";
import { storePosition } from "../services/position.service";

// Pages
import Home from "./index";
import Requests from "./requests";
import Admin from "./admin/index";
import Movie from "./movie/[pid]";
import Show from "./tv/[pid]";
import People from "./people/[pid]";
import MovieGenre from "./movie/genre/[pid]";
import ShowGenre from "./tv/genre/[pid]";
import Studio from "./movie/studio/[pid]";
import Network from "./tv/network/[pid]";
import NotFound from "./404";
import Search from "./search";
import Error from "../components/error";
import PwaInstall from "../components/pwaInstall";
import PwaAndroid from "../components/pwaAndroid";
import { getMobileOperatingSystem } from "../helpers/getOs";
import MyAccount from "./myAccount";
// import Modal from "../components/modal";

const mapStateToProps = (state) => {
  return {
    redux_pos: state.pos,
  };
};

function Petio({ redux_pos }) {
  const token = getToken();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    email: null,
    id: null,
    lastLogin: null,
    nameLower: null,
    quotaCount: null,
    role: null,
    thumb: null,
    title: null,
    username: null,
  });
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [globalConfig, setGlobalConfig] = useState(false);
  const [currentPath, setCurrentPath] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [showInstallAndroid, setShowInstallAndroid] = useState(false);
  const [androidInstallPrompt, setAndroidInstallPrompt] = useState(false);

  const router = useLocation();
  const history = useHistory();
  const OS = getMobileOperatingSystem();
  let setupMode = false;

  useEffect(() => {
    // Detects if device is on iOS
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    // Detects if device is in standalone mode
    const isInStandaloneMode = () =>
      "standalone" in window.navigator && window.navigator.standalone;

    // Checks if should display install popup notification:
    if (isIos() && !isInStandaloneMode()) {
      setShowInstall(true);
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setAndroidInstallPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowInstallAndroid(true);
      // Optionally, send analytics event that PWA install promo was shown.
      console.log(`'beforeinstallprompt' event was fired.`);
    });
  }, []);

  function newNotification(
    data = {
      message: String,
      type: "info",
      id: false,
    }
  ) {
    const msg = {
      timestamp: +new Date(),
      message: data.message,
      type: data.type,
    };
    const comp = <Notification msg={msg} />;
    if (data.id) {
      toast.update(data.id, {
        render: comp,
        type: data.type,
        isLoading: false,
        autoClose: 5000,
      });
      return;
    }
    switch (data.type) {
      case "error":
        toast.error(comp);
        break;
      case "warn":
        toast.warn(comp);
        break;
      case "success":
        toast.success(comp);
        break;
      case "loading":
        return toast.loading(comp);
      default:
        toast.info(comp);
        break;
    }
  }

  useEffect(() => {
    async function getConfig() {
      try {
        const config = await checkConfig();
        if (typeof config !== "object")
          throw "Config not parsed, returned a string";
        setGlobalConfig(config);
      } catch (e) {
        console.log(e);
        newNotification({
          type: "error",
          message: "Unable to communciate with Petio API",
        });
        setGlobalConfig({
          error: e,
        });
      }
    }

    getConfig();
    smoothscroll.polyfill();
  }, []);

  const updateRequests = useCallback(async () => {
    try {
      await getRequests();
    } catch (e) {
      console.log(e);
      newNotification({
        message: "Failed to get requests",
        type: "error",
      });
    }
  }, []);

  useEffect(() => {
    async function tokenLogin() {
      try {
        setLoadingScreen(true);
        const req = await login(false, true);
        setCurrentUser(req.user);
        setIsLoggedIn(true);
        setLoadingScreen(false);
        updateRequests();
      } catch {
        clearToken();
        console.log("Invalid token, logged out");
        newNotification({
          message: "Sesssion has expired, please log in again",
          type: "error",
        });
        setLoadingScreen(false);
      }
    }
    if (token && !isLoggedIn) {
      tokenLogin();
    }
  }, [token, isLoggedIn, updateRequests]);

  // Store Scroll Pos

  useLayoutEffect(() => {
    let bounce = false;
    function checkScroll() {
      if (history.location.pathname.startsWith("/admin")) return;
      clearTimeout(bounce);
      bounce = setTimeout(() => {
        storePosition(history.location.pathname, window.scrollY);
      }, 500);
    }

    window.addEventListener("scroll", checkScroll);
    window.addEventListener("touchend", () => {
      if (history.location.pathname.startsWith("/admin")) return;
      storePosition(history.location.pathname, window.scrollY);
    });
    window.addEventListener("mouseup", () => {
      if (history.location.pathname.startsWith("/admin")) return;
      storePosition(history.location.pathname, window.scrollY);
    });

    return () => {
      window.removeEventListener("scroll", checkScroll);
    };
  }, [history]);

  useEffect(() => {
    const oldPath = currentPath;
    const newPath = router.pathname;
    setCurrentPath(newPath);
    if (oldPath === newPath) return;
    if (redux_pos.pages[newPath]) {
      window.scrollTo(0, redux_pos.pages[newPath].scroll);
    } else {
      window.scrollTo(0, 0);
    }
  }, [router, redux_pos, currentPath]);

  if (!globalConfig) {
    return <Loading />;
  }

  if (globalConfig.config === false) {
    setupMode = true;
  }

  if (globalConfig && globalConfig.error) {
    return (
      <Layout isLoggedIn={isLoggedIn} currentUser={currentUser}>
        <Error />
        <ToastContainer
          className={notifications.wrap}
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={true}
          pauseOnHover
          transition={Slide}
          theme={"petio"}
        />
      </Layout>
    );
  }

  return (
    <Layout isLoggedIn={isLoggedIn} currentUser={currentUser}>
      {setupMode ? (
        <Setup config={globalConfig} newNotification={newNotification} />
      ) : null}
      {!setupMode && loadingScreen ? <Loading /> : null}
      {setupMode ? null : !isLoggedIn && globalConfig.config === true ? (
        <>
          {showInstall ? (
            <PwaInstall callback={() => setShowInstall(false)} />
          ) : null}
          {showInstallAndroid && OS === "Android" ? (
            <PwaAndroid
              callback={() => {
                setShowInstallAndroid(false);
                setAndroidInstallPrompt(false);
              }}
              prompt={androidInstallPrompt}
            />
          ) : null}
          <Login
            config={globalConfig}
            setIsLoggedIn={setIsLoggedIn}
            setCurrentUser={setCurrentUser}
            setLoadingScreen={setLoadingScreen}
            newNotification={newNotification}
          />
        </>
      ) : (
        <Switch>
          <Route exact path="/">
            <Home
              currentUser={currentUser}
              config={globalConfig}
              newNotification={newNotification}
            />
          </Route>
          <Route exact path="/requests">
            <Requests
              currentUser={currentUser}
              config={globalConfig}
              newNotification={newNotification}
            />
          </Route>
          <Route path="/admin">
            <Admin
              setIsLoggedIn={setIsLoggedIn}
              currentUser={currentUser}
              config={globalConfig}
              setCurrentUser={setCurrentUser}
              newNotification={newNotification}
            />
          </Route>
          <Route exact path="/movie/:pid">
            <Movie
              currentUser={currentUser}
              config={globalConfig}
              newNotification={newNotification}
              updateRequests={updateRequests}
            />
          </Route>
          <Route exact path="/movie/genre/:pid">
            <MovieGenre
              currentUser={currentUser}
              config={globalConfig}
              newNotification={newNotification}
            />
          </Route>
          <Route exact path="/movie/studio/:pid">
            <Studio
              currentUser={currentUser}
              config={globalConfig}
              newNotification={newNotification}
            />
          </Route>
          <Route exact path="/people/:pid">
            <People
              currentUser={currentUser}
              config={globalConfig}
              newNotification={newNotification}
            />
          </Route>
          <Route exact path="/tv/:pid">
            <Show
              currentUser={currentUser}
              config={globalConfig}
              newNotification={newNotification}
              updateRequests={updateRequests}
            />
          </Route>
          <Route exact path="/tv/genre/:pid">
            <ShowGenre
              currentUser={currentUser}
              config={globalConfig}
              newNotification={newNotification}
            />
          </Route>
          <Route exact path="/tv/network/:pid">
            <Network
              currentUser={currentUser}
              config={globalConfig}
              newNotification={newNotification}
            />
          </Route>
          <Route exact path="/search">
            <Search
              currentUser={currentUser}
              config={globalConfig}
              newNotification={newNotification}
            />
          </Route>
          <Route exact path="/my-account">
            <MyAccount
              currentUser={currentUser}
              config={globalConfig}
              newNotification={newNotification}
            />
          </Route>
          <Route path="*">
            <NotFound />
          </Route>
        </Switch>
      )}
      <ToastContainer
        className={notifications.wrap}
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
        theme={"petio"}
      />
    </Layout>
  );
}

export default withRouter(connect(mapStateToProps)(Petio));
