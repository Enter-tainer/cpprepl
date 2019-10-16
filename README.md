# cpprepl

![demo](./img/demo.svg)

a simple cpp repl with ghci style commands

## Install

``` bash
npm i -g cpprepl
```

## Config

``` bash
cpprepl --clang++ # use clang++
cpprepl --g++     # or use g++ for defaults
```

## Usage

```
cpprepl --help
```

## Commands

```
>>= :m iostream // load iostream
>>= :b i // show i in binary
>>= :t i // show i's type
>>= :q   // to quit
```

<!--
## TODO:

- add support for all STL
- add support for C when use :b
-->
