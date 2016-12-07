node-image
===

# ABOUT DEV

```bash
npm start
```

# ABOUT TEST

```bash
# this will run the istanbul cover engine which might cause the test to timeout
npm test
# use this when timeout
npm run test-no-cover
```

如果你希望仅仅执行某个 test case 则在项目根目录下执行如下命令 - 不要忘了 timeout 设置需要比较长

```bash
npm run build && NODE_ENV=test-no-cover ./node_modules/.bin/_mocha --require babel-polyfill --compilers js:babel-core/register --timeout 60000
# 或者跳过 build 且进行 cover
./node_modules/.bin/babel-node ./node_modules/.bin/babel-istanbul cover ./node_modules/.bin/_mocha -- --require babel-polyfill --timeout 60000 --grep ____
```

# ABOUT PUBLISH