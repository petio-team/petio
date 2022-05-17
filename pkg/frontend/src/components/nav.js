import media from "../services/media.service";
import { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
// import { useRouter } from 'next/router';

import styles from "../styles/components/nav.module.scss";
import typo from "../styles/components/typography.module.scss";
import inp from "../styles/components/input.module.scss";

import { Link } from "react-router-dom";
// import Image from 'next/image';
// import Router from 'next/router';

import { ReactComponent as Logo } from "../assets/svg/logo.svg";
import { ReactComponent as SearchIcon } from "../assets/svg/search.svg";
import { ReactComponent as MovieIcon } from "../assets/svg/movie.svg";
import { ReactComponent as RequestIcon } from "../assets/svg/request.svg";
import { ReactComponent as UserIcon } from "../assets/svg/user.svg";
import { ReactComponent as AdminIcon } from "../assets/svg/admin.svg";
import { ReactComponent as BackIcon } from "../assets/svg/back.svg";
import { resetScrollPosition } from "../services/position.service";

export default function Nav(props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [darken, setDarken] = useState(false);

  const history = useHistory();
  const inputRef = useRef();

  useEffect(() => {
    function handleResize() {
      setMobile(window.innerWidth < 992);
    }
    function handleScroll() {
      if (window.scrollY > 500) {
        setDarken(true);
      } else {
        setDarken(false);
      }
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function updateSearch(e) {
    const val = e.target.value;
    media.searchUpdate(val);
    setSearchQuery(val);
    changePath(val);
  }

  function clearSearch() {
    media.searchUpdate("");
    setSearchQuery("");
  }

  function submitSearch(e) {
    e.preventDefault();
    changePath(searchQuery);
  }

  function changePath(val) {
    if (history.location.pathname !== "/search" && val.length > 0)
      history.push("/search");
  }

  function toggleSearch() {
    if (!showSearch) {
      inputRef.current.focus();
    }
    setShowSearch(!showSearch);
  }

  function resetScrollPos(target) {
    if (!target) return;
    resetScrollPosition();
  }

  return (
    <>
      <div
        className={`${styles.nav} ${
          showSearch ? styles.nav__search_open : ""
        } ${darken ? styles.nav__darken : ""}`}
      >
        <div className="container">
          <div className={styles.nav__inner}>
            {history.location.pathname !== "/" ? (
              <div onClick={() => history.goBack()} className={styles.back_btn}>
                <span>
                  <BackIcon />
                </span>
              </div>
            ) : null}
            <div className={styles.nav__left}>
              <div className={styles.nav__logo}>
                <Link to="/" onClick={() => resetScrollPos("/")}>
                  <Logo viewBox="0 0 98 24" />
                </Link>
              </div>
              <div className={styles.nav__menu}>
                <Link
                  to="/"
                  onClick={() => resetScrollPos("/")}
                  className={`${typo.body} ${typo.bold}`}
                >
                  Movies &amp; TV
                </Link>
                <Link to="/requests" className={`${typo.body} ${typo.bold}`}>
                  Requests
                </Link>
                <Link to="/my-account" className={`${typo.body} ${typo.bold}`}>
                  My Account
                </Link>
                {props.currentUser.role === "admin" ||
                props.currentUser.role === "moderator" ? (
                  <Link to="/admin" className={`${typo.body} ${typo.bold}`}>
                    Admin
                  </Link>
                ) : null}
              </div>
            </div>
            <div className={styles.nav__right}>
              <div
                className={`${styles.collapse_search} ${
                  showSearch ? "" : styles.collapse_search__collapsed
                }`}
              >
                <form className={inp.wrap} onSubmit={submitSearch}>
                  <input
                    typo="text"
                    className={`${inp.text} ${inp.search}`}
                    value={searchQuery}
                    placeholder="Seach..."
                    onChange={updateSearch}
                    ref={inputRef}
                  />
                  {searchQuery.length > 0 ? (
                    <div className={inp.clear} onClick={clearSearch}></div>
                  ) : null}
                </form>
              </div>
              <div className={styles.nav__search_icon} onClick={toggleSearch}>
                <SearchIcon />
              </div>
              <Link to="/my-account" className={styles.nav__thumb}>
                {props.currentUser.thumbnail ? (
                  <img
                    src={props.currentUser.thumbnail}
                    alt={props.currentUser.title}
                  />
                ) : null}
              </Link>
            </div>
          </div>
        </div>
      </div>
      {mobile ? (
        <div className={styles.mobile_nav}>
          <Link
            to="/"
            onClick={() => resetScrollPos("/")}
            className={`${typo.xsmall} ${styles.mobile_nav__item} ${
              history.location.pathname === "/"
                ? styles.mobile_nav__item__active
                : ""
            }`}
          >
            <span>
              <MovieIcon />
            </span>
            Movies &amp; TV
          </Link>
          <Link
            to="/requests"
            className={`${typo.xsmall} ${styles.mobile_nav__item} ${
              history.location.pathname === "/requests"
                ? styles.mobile_nav__item__active
                : ""
            }`}
          >
            <span className="stroke">
              <RequestIcon />
            </span>
            Requests
          </Link>
          <Link
            to="/my-account"
            className={`${typo.xsmall} ${styles.mobile_nav__item} ${
              history.location.pathname === "/my-account"
                ? styles.mobile_nav__item__active
                : ""
            }`}
          >
            <span>
              <UserIcon />
            </span>
            My Account
          </Link>
          {props.currentUser.role === "admin" ||
          props.currentUser.role === "moderator" ? (
            <Link
              to="/admin"
              className={`${typo.xsmall} ${styles.mobile_nav__item} ${
                history.location.pathname === "/admin"
                  ? styles.mobile_nav__item__active
                  : ""
              }`}
            >
              <span>
                <AdminIcon />
              </span>
              Admin
            </Link>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
