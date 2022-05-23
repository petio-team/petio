import * as cvtError from "./../error";
const CUSTOMISE_FAILED = cvtError.CUSTOMISE_FAILED;
const INCORRECT_USAGE = cvtError.INCORRECT_USAGE;

/**
 * Getter will parse specified keyname and use the only argument to get the wanted
 *
 * @private
 * @class
 */
function Getter() {
  this.storage = {
    order: ["value", "force"],
    list: {},
  };
}

export default Getter;

/**
 * Adds a new custom getter
 */
Getter.prototype.add = function (keyname, getter, usedOnlyOnce, rewrite) {
  if (typeof keyname !== "string") {
    throw new CUSTOMISE_FAILED(
      'Getter keyname must be a string (current: "' + typeof keyname + '").'
    );
  }
  if (typeof getter !== "function") {
    throw new CUSTOMISE_FAILED(
      'Getter function for "' + keyname + '" must be a function.'
    );
  }
  if (
    [
      "_cvtCoerce",
      "_cvtValidateFormat",
      "_cvtGetOrigin",
      "format",
      "required",
      "value",
      "force",
    ].includes(keyname)
  ) {
    throw new CUSTOMISE_FAILED(
      "Getter keyname use a reservated word: " + keyname
    );
  }
  if (this.storage.list[keyname] && !rewrite) {
    const advice =
      " Set the 4th argument (rewrite) of `addGetter` at true to skip this error.";
    throw new CUSTOMISE_FAILED(
      'Getter keyname "' + keyname + '" is already registered.' + advice
    );
  }

  if (typeof usedOnlyOnce !== "function") {
    usedOnlyOnce = !!usedOnlyOnce;
  }

  if (!this.storage.list[keyname]) {
    // add before the last key (= force), force must always be the last key
    this.storage.order.splice(this.storage.order.length - 1, 0, keyname);
  }
  this.storage.list[keyname] = {
    usedOnlyOnce: usedOnlyOnce,
    getter: getter,
  };
};

/**
 * @returns Returns sorted function which sorts array to newOrder
 */
Getter.prototype.cloneStorage = function () {
  const storage = this.storage;
  return {
    order: [...storage.order],
    list: { ...storage.list },
  };
};

/**
 * @returns Returns sorted function which sorts array to newOrder
 */
Getter.prototype.sortGetters = function (currentOrder, newOrder) {
  if (!Array.isArray(newOrder)) {
    throw new INCORRECT_USAGE("Invalid argument: newOrder must be an array.");
  }

  // 'force' must be at the end or not given
  const forceOrder = newOrder.indexOf("force");
  if (forceOrder !== -1 && forceOrder !== newOrder.length - 1) {
    throw new INCORRECT_USAGE("Invalid order: force cannot be sorted.");
  } else if (forceOrder !== newOrder.length - 1) {
    newOrder.push("force");
  }

  // exact number of getter name (not less & not more)
  const checkKey = [...currentOrder];
  for (let i = newOrder.length - 1; i >= 0; i--) {
    const index = checkKey.indexOf(newOrder[i]);
    if (index !== -1) {
      checkKey.splice(index, 1);
    } else {
      throw new INCORRECT_USAGE(
        "Invalid order: unknown getter: " + newOrder[i]
      );
    }
  }
  if (checkKey.length !== 0) {
    const message =
      checkKey.length <= 1 ? "a getter is " : "several getters are ";
    throw new INCORRECT_USAGE(
      "Invalid order: " + message + "missed: " + checkKey.join(", ")
    );
  }

  return (a, b) => newOrder.indexOf(a) - newOrder.indexOf(b);
};
