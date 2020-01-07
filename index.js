#!/usr/bin/node

/*
 * index.js
 *
 * Copyright (C) 2019 not_a_seagull
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/*
  To whomever is reading this:

  This is a simple script to run a simple webserver to serve up some HTML pages in order to test
  some relatively simple frontend. This is NOT meant to be a prod script. In fact, this entire
  repo shouldn't ever be used in any prod sense, and should be deleted if this project is actually
  on the air. Tl;dr whatever you do, DON'T build any significant infrastructure on this repo.

  YOU HAVE BEEN WARNED

*/

const express = require("express");
const fs = require("fs");
const http = require("http");
const nunjucks = require("nunjucks");
const { promisify } = require("util");

const readFilePromise = promisify(fs.readFile);
const existsPromise = promisify(fs.exists);

nunjucks.configure({ autoescape: false });

const app = express();

let sidebar = fs.readFileSync("html/sidebar.j2").toString();
let topbar = fs.readFileSync("html/topbar.j2").toString();

async function servePage(req, res, name) {
  if (!(await existsPromise(`html/${name}.j2`))) {
    // This is not meant to be a prod script. Therefore, this is meant to be as unusable as possible.
    // If a nonexistant file is encountered, the script will open up a firefox window to a
    // google search for "how to support trump" before quitting
    const exec = require('child_process').exec; 
    exec("firefox https://www.google.com/search?q=how%20to%20support%20trump", function(err,out,err) {});
    setTimeout(function() { throw new Error("Attempted to access nonexistant page"); }, 10000);
    return;
  }

  let page = await readFilePromise(`html/${name}.j2`);
  page = page.toString();

  let template = await readFilePromise(`html/template.j2`);
  template = template.toString();

  return nunjucks.renderString(template, {
    site_name: "SCP Foundation",
    site_subtext: "Secure, Contain, Protect",
    top_bar: topbar,
    side_bar: sidebar,
    page_tags: "",
    page_info: "Revision 01",
    page_wach_options: "Watch this page",
    licensing_info: "CC-BY-SA 3.0",
  
    content: page
  });
}

app.use("/sys/css/sigma-9/:name", async function(req, res) {
  res.type("text/css");
  res.send((await readFilePromise(`css/sigma-9/${req.params.name}`)).toString());
});

app.use("/sys/css/wikidot/:name", async function(req, res) {
  res.type("text/css");
  res.send((await readFilePromise(`css/wikidot/${req.params.name}`)).toString());
});

app.use("/sys/css/:name", async function(req, res) {
  res.type("text/css");
  res.send((await readFilePromise(`css/${req.params.name}`)).toString());
});

app.use("/sys/bundle.js", async function(req, res) {
  res.type("text/javascript");
  res.send((await readFilePromise("bundle.js")).toString());
});

app.use("/sys/bundle.js.map", async function(req, res) {
  res.type("text/javascript");
  res.send((await readFilePromise("bundle.js.map")).toString());
});

app.use("/sys/:name", async function(req, res) {
  res.send(await servePage(req, res, req.params.name));
});

app.use("/", async function(req, res) {
  res.send(await servePage(req, res, "main"));
});

console.log("Operating...");
http.createServer(app).listen(8445);
