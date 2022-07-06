import { define } from "../src/index.js"

describe("if blocks", () => {
  it("renders the elements", () => {
    let name = createName()
    define(
      name,
      () => ({
        state: {
          loggedIn: false,
        },
      }),
      `
        <button :if="!loggedIn" id="login">LOG IN</button>
        <button :if="loggedIn" id="logout">LOG OUT</button>
    `
    )

    mount(`<${name}></${name}>`)

    assert.ok($("button#login"))
    assert.notOk($("button#logout"))
  })
  it("renders the elements", () => {
    let name = createName()
    define(
      name,
      () => ({
        state: {
          loggedIn: true,
        },
      }),
      `
        <button :if="!loggedIn" id="login">LOG IN</button>
        <button :if="loggedIn" id="logout">LOG OUT</button>
    `
    )

    mount(`<${name}></${name}>`)

    assert.ok($("button#logout"))
    assert.notOk($("button#login"))
  })
  it("toggles the elements", async () => {
    //...
    let name = createName()
    define(
      name,
      () => ({
        state: {
          loggedIn: false,
        },
        update: {
          logIn(state) {
            return {
              ...state,
              loggedIn: true,
            }
          },
          logOut(state) {
            return {
              ...state,
              loggedIn: false,
            }
          },
        },
      }),
      `
        <button :onclick="logIn" :if="!loggedIn" id="login">LOG IN</button>
        <button :onclick="logOut" :if="loggedIn" id="logout">LOG OUT</button>
    `
    )

    mount(`<${name}></${name}>`)

    $("button#login").click()

    await nextFrame()

    assert.ok($("button#logout"))
    assert.notOk($("button#login"))
  })
})
