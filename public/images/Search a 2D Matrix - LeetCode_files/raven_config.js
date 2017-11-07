var releaseVersion = 'a82372b7e05483c2668c0f5ed363fea0d0fa2828';
// THIS_WILL_BE_PREPENDED_BY_JENKINS_JOB_FOR_MASTER_DEPLOYMENT
// var releaseVersion = 'HERE_COMES_RELEASE_NO';

var release = 'unnamed_release';
if (typeof(releaseVersion) !== 'undefined') {
  release = releaseVersion;
}

Raven.config('https://9a368fd196e04ae49890f46320c53bcd@sentry.io/233786', {
  release: release
}).install();
