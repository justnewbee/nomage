node-image
===

# ABOUT DEV

```bash
npm install
npm start
```

# ABOUT TEST

```bash
npm test
# or if you want to see code coverage... however this might case timeout
npm run test-cover
```

如果你希望仅仅执行某些 test case 可以利用 mocha 的 `--grep` 参数，它会过滤出你想测试的 case

在项目根目录下执行如下命令 - 不要忘了 timeout 设置需要比较长

```bash
# build 并执行覆盖率检测
npm run build && ./node_modules/.bin/babel-node ./node_modules/.bin/babel-istanbul cover --report html ./node_modules/.bin/_mocha -- --require babel-polyfill --timeout 60000 --grep ____

# 跳过 build 执行检测覆盖率
./node_modules/.bin/babel-node ./node_modules/.bin/babel-istanbul cover --report html ./node_modules/.bin/_mocha -- --require babel-polyfill --timeout 60000 --grep ____

# build 且不执行覆盖率检测
npm run build && NODE_ENV=test-no-cover ./node_modules/.bin/_mocha --require babel-polyfill --compilers js:babel-core/register --timeout 20000 --grep ____

# 跳过 build 且不执行覆盖率检测
NODE_ENV=test-no-cover ./node_modules/.bin/_mocha --require babel-polyfill --compilers js:babel-core/register --timeout 20000 --grep ____
```

# ABOUT PUBLISH