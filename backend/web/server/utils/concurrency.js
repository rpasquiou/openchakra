function delayPromise(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function runPromisesWithDelay(promises) {
  const results = [];

  function processPromise(index, delay) {
    if (index === promises.length) {
      return results;
    }

    const promiseFn = promises[index];
    return promiseFn()
      .then(value => {
        results.push({ status: 'fulfilled', value });
        return delayPromise(delay); // Delay between promises (adjust as needed)
      })
      .catch(reason => {
        results.push({ status: 'rejected', reason });
        return delayPromise(delay); // Delay between promises (adjust as needed)
      })
      .then(() => processPromise(index + 1));
  }

  return processPromise(0)
}

const runPromiseUntilSuccess = (promiseFn, maxAttempts = 3, delay = 1000) => {
  return new Promise((resolve, reject) => {
      let attempts = 0

      const attempt = () => {
          attempts++
          promiseFn()
              .then(resolve)
              .catch((error) => {
                  if (attempts >= maxAttempts) {
                      reject(`Failed after ${maxAttempts} attempts: ${error}`)
                  } else {
                      setTimeout(attempt, delay)
                  }
              });
      };

      attempt()
  })
}

module.exports={
  delayPromise,
  runPromisesWithDelay,
  runPromiseUntilSuccess,
}
