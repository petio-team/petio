import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation, withRouter } from 'react-router-dom';
import { Route, Switch } from 'react-router-dom';
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import smoothscroll from 'smoothscroll-polyfill';

import Error from '../components/error';
import Layout from '../components/layout';
import { Loading } from '../components/loading';
import { Login } from '../components/login';
import Notification from '../components/notification';
import PwaAndroid from '../components/pwaAndroid';
import PwaInstall from '../components/pwaInstall';
import ErrorHandler from '../helpers/errorHandler';
import { getMobileOperatingSystem } from '../helpers/getOs';
import { checkConfig } from '../services/config.service';
import { storePosition } from '../services/position.service';
import {
  clearToken,
  getRequests,
  getReviews,
  getToken,
  login,
} from '../services/user.service';
import notifications from '../styles/components/notifications.module.scss';
import '../styles/global/main.scss';
import NotFound from './404';
import Admin from './admin/index';
// Pages
import Home from './index';
import Movie from './movie/[pid]';
import Company from './multi/company/[pid]';
import Genre from './multi/genre/[pid]';
import MyAccount from './myAccount';
import People from './people/[pid]';
import Requests from './requests';
import Search from './search';
import Setup from './setup';
import Show from './tv/[pid]';

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
      'standalone' in window.navigator && window.navigator.standalone;

    // Checks if should display install popup notification:
    if (isIos() && !isInStandaloneMode()) {
      setShowInstall(true);
    }

    window.addEventListener('beforeinstallprompt', (e) => {
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
      type: 'info',
      id: false,
    },
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
      case 'error':
        toast.error(comp);
        break;
      case 'warn':
        toast.warn(comp);
        break;
      case 'success':
        toast.success(comp);
        break;
      case 'loading':
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
        if (typeof config !== 'object')
          throw 'Config not parsed, returned a string';
        setGlobalConfig(config);
      } catch (e) {
        console.log(e);
        newNotification({
          type: 'error',
          message: 'Unable to communciate with Petio API',
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
        message: 'Failed to get requests',
        type: 'error',
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
        getReviews();
      } catch {
        clearToken();
        console.log('Invalid token, logged out');
        newNotification({
          message: 'Sesssion has expired, please log in again',
          type: 'error',
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
      if (history.location.pathname.startsWith('/admin')) return;
      clearTimeout(bounce);
      bounce = setTimeout(() => {
        storePosition(history.location.pathname, window.scrollY);
      }, 500);
    }

    window.addEventListener('scroll', checkScroll);
    window.addEventListener('touchend', () => {
      if (history.location.pathname.startsWith('/admin')) return;
      storePosition(history.location.pathname, window.scrollY);
    });
    window.addEventListener('mouseup', () => {
      if (history.location.pathname.startsWith('/admin')) return;
      storePosition(history.location.pathname, window.scrollY);
    });

    return () => {
      window.removeEventListener('scroll', checkScroll);
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

  if (globalConfig.config === false || globalConfig.config === undefined) {
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
          theme={'petio'}
        />
      </Layout>
    );
  }

  return (
    <Layout isLoggedIn={isLoggedIn} currentUser={currentUser}>
      <ErrorHandler newNotification={newNotification}>
        {setupMode ? (
          <Setup config={globalConfig} newNotification={newNotification} />
        ) : null}
        {!setupMode && loadingScreen ? <Loading /> : null}
        {setupMode ? null : !isLoggedIn && globalConfig.config === true ? (
          <>
            {showInstall ? (
              <PwaInstall callback={() => setShowInstall(false)} />
            ) : null}
            {showInstallAndroid && OS === 'Android' ? (
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
              <Genre
                type="movie"
                currentUser={currentUser}
                config={globalConfig}
                newNotification={newNotification}
              />
            </Route>
            <Route exact path="/movie/studio/:pid">
              <Company
                currentUser={currentUser}
                config={globalConfig}
                newNotification={newNotification}
                type="studio"
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
              <Genre
                type="tv"
                currentUser={currentUser}
                config={globalConfig}
                newNotification={newNotification}
              />
            </Route>
            <Route exact path="/tv/network/:pid">
              <Company
                currentUser={currentUser}
                config={globalConfig}
                newNotification={newNotification}
                type="network"
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
          theme={'petio'}
        />
      </ErrorHandler>
    </Layout>
  );
}

export default withRouter(connect(mapStateToProps)(Petio));
