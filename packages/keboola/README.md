# apify-keboola helpers

This library helps upload data from [Apify](https://apify.com/?fpr=rarous) platform to Keboola Connection (KBC).

## Install

```shell
npm install @hckr_/apify-keboola
```

```shell
yarn add @hckr_/apify-keboola
```

## Input

### Usage

```javascript
import { parseInput } from "@hckr_/apify-keboola";
```

## Uploader

[Keboola Uploader](https://apify.com/hckr-studio/keboola-uploader?fpr=rarous) is an actor on Apify platform for reliable uploads of structured data from Apify Datasets to Keboola Table. This library provides convenience function for easy use of the actor from you custom actor code.

### Usage

You can use free (pay per usage) variant:

```javascript
import { uploadToKeboola } from "@hckr_/apify-keboola";
```

Or you can support our work on https://www.hlidacshopu.cz/ with the [paid option](https://apify.com/hlidac-shopu/keboola-uploader?fpr=rarous):

```javascript
import { uploadToKeboola } from "@hckr_/apify-keboola/hlidac-shopu";
```
