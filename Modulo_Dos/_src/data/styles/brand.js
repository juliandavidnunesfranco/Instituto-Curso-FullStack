// A diferencia de los demás archivos en esta carpeta, este NO se descarga
// del CDN del instituto original: es un override local. Va último en el
// `{% set css %}` de los layouts para ganarle, por orden de cascada (mismo
// selector, misma especificidad, pero declarado después), al negro/amarillo
// que traen header.css, footer.css, sidebar.css, topbar.css y lesson.css
// remotos.
module.exports = function () {
  return `
    .headerContainer,
    .headerContained,
    .footerContainer,
    .headerResponsive,
    .headerResponsive .menuDiv a {
      background-color: #2E4F8F;
    }

    .lesson h1 {
      border-bottom-color: #2E4F8F;
    }

    .sidebar a:active {
      color: #2E4F8F;
    }

    .topnav .activeLink {
      color: #2E4F8F;
      border-bottom: 3px solid #2E4F8F;
    }

    .brandLogo {
      height: 32px;
      width: auto;
    }

    .headerResponsive .brandLogo {
      height: 22px;
      margin-right: 10px;
    }
  `
}
