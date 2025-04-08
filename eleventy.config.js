const govukEleventyPlugin = require('@x-govuk/govuk-eleventy-plugin')
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy({ "app/assets/": "assets/"});
  eleventyConfig.addPassthroughCopy({ "CNAME": "CNAME"});
  eleventyConfig.addPassthroughCopy({ ".nojekyll": ".nojekyll"});

  let govukPluginOptions = {
    scssSettingsPath: "/css/_settings.scss",
    header: {
      organisationName: 'HM Revenue & Customs',
      productName: 'Engineering Guidance',
      logotype: {
        html:
          '<span class="govuk-header__logotype">' +
          '  <img src="/assets/hmrc_crest_18px_x2.png" height="34px" alt="HM Revenue & Customs logo">' +
          '  <span class="govuk-header__logotype-text">HM Revenue & Customs</span>' +
          '</span>'
      },
      search: {
        indexPath: '/search.json',
        sitemapPath: '/sitemap.html'
      }
    },
    footer: {
      copyright: {
        html: '© <a class="govuk-footer__link govuk-footer__copyright-logo" href="https://github.com/hmrc/engineering-site-spike/LICENCE">Crown copyright (HM Revenue & Customs)</a>'
      },
      meta: {
        items: [
          {
            href: '/cookies/',
            text: 'Cookies'
          },
          {
            href: '/accessibility-statement/',
            text: 'Accessibility statement'
          },
          {
            href: 'https://github.com/hmrc/engineering-site-spike',
            text: 'Github repository'
          }
        ]
      }
    },
    stylesheets: ['/css/base.css'],
  }

  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('d MMMM yyyy');
  });

  // Register the plugin
  eleventyConfig.addPlugin(govukEleventyPlugin, govukPluginOptions)

  eleventyConfig.addCollection("getAllEngineeringPrinciplesOrderedByID", function(collectionApi) {
    return collectionApi.getFilteredByGlob("**/engineering-principles/*.md").sort(function(a, b) {
      return a.data.id - b.data.id; // sort by ID ascending
    })
  });

  eleventyConfig.addCollection("getAllStandardsByName", function(collectionApi) {
    return collectionApi.getFilteredByGlob("**/standards/*.md").sort(function(a, b) {
      return a.data.title.localeCompare(b.data.title); // sort by title ascending
    });
  });

  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  return {
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    dir: {
      input: 'app',
      output: 'dist',
      // Use layouts from the plugin
      layouts: '../node_modules/@x-govuk/govuk-eleventy-plugin/layouts'
    }
  }
};
