var last7DaysArr = [],
hoursGenArr =[], hh, initData,
pageTypeValue = document.getElementById('opt-pageType').value;

function getData() {
  var dataGet, xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "dataGet.php", true);
  xmlhttp.onload = function() {
      dataGet = JSON.parse(xmlhttp.responseText);
      initData = dataGet;
      runEverything();
  }
  xmlhttp.send();
  setTimeout(getData, 600000);
}

function runEverything() {
  console.log(initData);
  getScatterHS(initData.maxPageType);
  getScatterPageHS(initData);
  getFilterData(initData.maxPageType);
  getMapHS(initData.totalVisitPerCountry);
  updateClock();
  setLast7Days();
  setPast24Hours();
  removeLoader();
}

function removeLoader() {
  var getLoader = document.getElementsByClassName('operations-loader');
  
  for(i = 0; i < getLoader.length; i++) {
    getLoader[i].style.display = 'none';
  }
}

function formatDate(date) {
  var dd = date.getDate(),
  mm = date.getMonth() + 1,
  yyyy = date.getFullYear();
  
  if (dd < 10) { 
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  
  date = yyyy + '-' + mm + '-' + dd;
  return date;
}

function setLast7Days() {
  for (var i = 7; i > 0; i--) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    last7DaysArr.push( formatDate(d) );
  }
}

function setPast24Hours() {
  var d = new Date(),
  hh = d.getHours() - 8,
  ctr = 0,
  hrCnt = 0;
  
  hh = hh < 0 ? 24 + hh : hh;

  for (var i = hh; i < 24; i++) {
    hoursGenArr.push((i - hrCnt) < 10 ? '0' + (i - hrCnt) + ':00' : (i - hrCnt) + ':00');
    if (0 == hrCnt) {
      ctr++;
      if (23 == i) {
        hrCnt = ctr;
        i = hrCnt - 1;
      }
    }
  }
}

function updateClock() {
  var now = new Date(),
  minutes = now.getMinutes(),
  hours = now.getHours(),
  dd = now.getDate(),
  mm = now.getMonth() + 1, //January is 0!
  yyyy = now.getFullYear();
  
  if(minutes < 10) {
      minutes = '0' + minutes;
  };
  
  if(hours < 10) {
      hours = '0' + hours;
  };

  if(dd < 10) {
      dd = '0'+ dd;
  };

  if(mm < 10 ) {
      mm = '0' + mm;
  };

  var today = mm + '/' + dd + '/' + yyyy,
  time = hours + ':' + minutes;

  document.getElementById('time').innerHTML = [today, time].join(' ');
  setTimeout(updateClock, 30000);
};

function getPageloadHS(initData, filterValue) {
  var data = [],
  appData = [],
  startHr;

  for (i = 0; i < initData.length; i++) {
    if(initData[i].appid == filterValue && pageTypeValue == initData[i].type) {
        appData.push(initData[i]);
    }
  }

  i = 0;
  hrCnt = 0;
  hrCtr = 0;
  
  for (ctr = hh; ctr < 24; ctr++) {  
    if (i < appData.length && parseInt(appData[i].hourtime) == ctr - hrCnt) {
      startHr = parseInt(appData[i].hourtime) - hh;
      data.push({
        x: startHr < 0 ? 24 + startHr : startHr,
        y: parseFloat(appData[i].max),
        time: appData[i].snapdate,
        pageHits: appData[i].hits,
        uniqueVisitors: appData[i].totaluniquevisitor,
        portfolio: appData[i].portfolio,
        managingDirector: appData[i].md,
        areaLead: appData[i].lead,
        operationsManager: appData[i].manager,
        serviceTier: appData[i].servicetier,
        application: appData[i].appid + ' - ' + appData[i].appname,
        pageName: appData[i].pagename,
        color: parseFloat(appData[i].max) > 3 ? 'red' : 'green'
      });
      i++;
    } else {
      startHr = ctr - hrCnt - hh;
      data.push({
        x:  startHr < 0 ? 24 + startHr : startHr,
        y: 0,
        color: 'white'
      });
    }

    if (0 == hrCnt) {
      hrCtr++;
      if(23 == ctr) {
        hrCnt = hrCtr;
        ctr = hrCnt - 1;
      }
    }
  }
        
  Highcharts.chart('opt-pageLoad', {
    chart: {
      type: 'line'
    },
    title: {
      text: ''
    },
    subtitle: {
      text: ''
    },
    xAxis: {
      min: 0,
      max: 23,
      categories: hoursGenArr,
      title: {
        text: 'Past 24 hrs in CST'
      },
      plotLines: [{
        color: '#444',
        width: 1,
        value: 24 - hh - 0.5,
        dashStyle: 'Solid',
        label: {
          text: 'New day',
          align: 'left',
          rotation: 0,
          style: {
            color: '#aaa'
          }
        },
      }]
    },
    yAxis: {
      minRange: 3,
      min: 0,
      title: {
        text: 'Pageload time'
      },
      labels: {
        format: '{value}s'
      },
      gridLineColor: '#111111',
      plotLines: [{
        color: '#ffff4d',
        width: 1,
        value: 3,
        label: {
          text: 'Target = 3.0 sec',
          align: 'left',
          style: {
            color: '#ffff4d'
          }
        },
        dashStyle: 'Dash'
      }]
    },
    tooltip: {
      formatter: function() {
        if (!this.point.pageName) {
          tooltipText = '<b>No Data</b>';
        } else {
          tooltipText = '<b>' + this.point.pageName + '</b><br>' +
          'Time: <b>' + this.point.time + 'CST </b><br>' +
          'Max Pageload(sec): <b>' + this.point.y + '</b><br>' +
          'Page Hits: <b>' + this.point.pageHits + '</b><br>' +
          'Unique Visitors: <b>' + this.point.uniqueVisitors + '</b><br>' +
          '----------------------------------------<br>' +
          'Portfolio: <b>' + this.point.portfolio + '</b><br>' +
          'Managing Director: <b>' + this.point.managingDirector + '</b><br>' +
          'Area Lead: <b>' + this.point.areaLead + '</b><br>' +
          'Operations Manager: <b>' + this.point.operationsManager + '</b><br>' +
          'Service Tier: <b>' + this.point.serviceTier + '</b><br>' +
          'Application: <b>' + this.point.application + '</b><br>';
        }
        return tooltipText;
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    series: [{
      color: '#cccccc',
      data: data,
      lineWidth: 1
    }]
  });
}

function getPageloadWeekHS(initData, filterValue) {
  var data = [],
  appData = [];

  for (i = 0; i < initData.length; i++) {
    if(initData[i].appid == filterValue && pageTypeValue == initData[i].type) {
      appData.push(initData[i]);
    }
  }

  i = 0;
  for (ctr = 0; ctr < 7; ctr++) {
    if (i < appData.length && appData[i].snapdate.split(' ')[0] == last7DaysArr[ctr]) {
      data.push({
        x: ctr,
        y: parseFloat(appData[i].max),
        time: appData[i].snapdate,
        pageHits: appData[i].hits,
        uniqueVisitors: appData[i].totaluniquevisitor,
        portfolio: appData[i].portfolio,
        managingDirector: appData[i].md,
        areaLead: appData[i].lead,
        operationsManager: appData[i].manager,
        serviceTier: appData[i].servicetier,
        application: appData[i].appid + ' - ' + appData[i].appname,
        pageName: appData[i].pagename,
        color: parseFloat(appData[i].max) > 3 ? 'red' : 'green'
      });
      i++;
    } else {
      data.push({
        x: ctr,
        y: 0,
        color: 'white'
      });
    }
  }

  Highcharts.chart('opt-pageLoad-week', {
    chart: {
      type: 'line'
    },
    title: {
      text: ''
    },
    subtitle: {
      text: ''
    },
    xAxis: {
      min: 0,
      max: 6,
      categories: last7DaysArr,
      title: {
        text: 'Past 7 days'
      }
    },
    yAxis: {
      minRange: 3,
      min: 0,
      title: {
        text: 'Pageload time'
      },
      labels: {
        format: '{value}s'
      },
      gridLineColor: '#111111',
      plotLines: [{
        color: 'yellow',
        width: 2,
        value: 3,
        label: {
          text: 'Target = 3.0 sec',
          align: 'left',
          style: {
            color: 'yellow'
          }
        },
        dashStyle: 'dash'
      }]
    },
    tooltip: {
      formatter: function() {
        if (!this.point.pageName) {
          tooltipText = '<b>No Data</b>';
        } else {
          tooltipText = '<b>' + this.point.pageName + '</b><br>' +
          'Time: <b>' + this.point.time + '</b><br>' +
          'Max Pageload(sec): <b>' + this.point.y + '</b><br>' +
          'Page Hits: <b>' + this.point.pageHits + '</b><br>' +
          'Unique Visitors: <b>' + this.point.uniqueVisitors + '</b><br>' +
          '----------------------------------------<br>' +
          'Portfolio: <b>' + this.point.portfolio + '</b><br>' +
          'Managing Director: <b>' + this.point.managingDirector + '</b><br>' +
          'Area Lead: <b>' + this.point.areaLead + '</b><br>' +
          'Operations Manager: <b>' + this.point.operationsManager + '</b><br>' +
          'Service Tier: <b>' + this.point.serviceTier + '</b><br>' +
          'Application: <b>' + this.point.application + '</b><br>';
        }
        return tooltipText;
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    series: [{
      color: '#cccccc',
      data: data,
      lineWidth: 1
    }]
  });
}

function getScatterHS(initData) {
  var generatedDataValue = generateData(initData);
  getThreshold(generatedDataValue[0], generatedDataValue[1]);

  function getThreshold(hcValue, pageValue) {
    var cr = pageValue;

    switch(cr) {
      case 3:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'dash', 
          value: 3,
          color: '#ffff4d',
          width: 1,
          id: 'plot-line-1',
          label: {
            text: "Target = 3.0 sec",
            style: {
              color: '#ffff4d'
            }
          }
        });
        break;
      case 5:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'dash',
          value: 5,
          color: '#ffff4d',
          width: 2,
          id: 'plot-line-1',
          label: {
            text: "Target = 5.0 sec",
            style: {
              color: '#ffff4d'
            }
          }
        });
        break;
      case 8:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'dash',
          value: 8,
          color: '#ffff4d',
          width: 2,
          id: 'plot-line-1',
          label: {
            text: "Target = 8.0 sec",
            style: {
              color: '#ffff4d'
            }
          }
        });
        break;
      default:
        break;
    }
  }

  function generateData(dataToManipulate) {
    var series = [];

    for (i = 0; i < dataToManipulate.maxPageType.length; i++) {
      var pageTypeObj = dataToManipulate.maxPageType[i],
      dataX = parseFloat(pageTypeObj.totaluniquevisitor , 10),
      dataY = parseFloat(pageTypeObj.max , 10),
      iconColor = 'rgba(0,175,80,0.5)',
      pageType = 'rarely',
      pageTypeVal = 0,
      iconShape = 'circle',
      maxThresholdValue = 3,
      serviceTier = pageTypeObj.servicetier;

      switch(serviceTier) {
        case 'Nearly Always On':
          iconShape = 'triangle';
          break;
        case 'Always On':
          iconShape = 'circle';
          break;
        case 'Standard':
          iconShape = 'square';
          break;
        default:
          break;
      }

      if (dataY >= 3) {
        iconColor = 'rgba(255,0,34,0.5)';
      }

      if(pageTypeValue == pageTypeObj.type) {
        series.push({
          name: pageTypeObj.appid  + ' - ' +pageTypeObj.appname,
          color: iconColor,
          data: [{
            x: dataX,
            y: dataY,
            portfolio: pageTypeObj.portfolio,
            md: pageTypeObj.md,
            areaLead: pageTypeObj.lead,
            opMd: pageTypeObj.manager,
            serviceTier: pageTypeObj.servicetier,
            maxPageLoad: pageTypeObj.max,
            totalPageVisits: pageTypeObj.hits,
            totalUniqueVisitors: pageTypeObj.totaluniquevisitor,
            type: pageTypeObj.type
          }],
          marker: {
            symbol: iconShape
          }
        });
      }
    }

    var hc = Highcharts.chart('opt-scatter', {
      chart: {
        type: 'scatter',
        zoomType: 'xy',
        height: 250
      },
      title: {
        text: ''
      },
      subtitle: {
        text: ''
      },
      xAxis: {
        min: 0,
        title: {
          enabled: true,
          text: 'Unique Visitor',
        },
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true
      },
      yAxis: {
        gridLineColor: '#1b1b1b',
        type: 'logarithmic',
        title: {  
          text: 'Max Page Load'
        }
      },
      legend: {
        enabled: false,
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'top',
        x: 370,
        y: 200,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
        borderWidth: 1
      },
      plotOptions: {
        scatter: {
          marker: {
            symbol: 'circle',
            radius: 5,
            states: {
              hover: {
                enabled: true,
                lineColor: 'rgb(100,100,100)'
              }
            }
          },
          states: {
            hover: {
              marker: {
                enabled: false
              }
            }
          },
        }
      },
      tooltip: {
        headerFormat: '',
        formatter: function() {
          return '<b>' + this.series.name + '</b><br>' +
          'Portfolio:<b>' + this.point.portfolio + '</b><br>' +
          'Managing Director:<b>' + this.point.md + '</b><br>' +
          'Area Lead:<b>' + this.point.areaLead + '</b><br>' +
          'Operations Manager:<b>' + this.point.opMd + '</b><br>' +
          'Service Tier:<b>' + this.point.serviceTier + '</b><br>' +
          'Max Pageload(sec):<b>' + this.point.maxPageLoad + '</b><br>' +
          'Total Page Hits:<b>' + this.point.totalPageVisits + '</b><br>' +
          'Total Unique Visitors:<b>' + this.point.totalUniqueVisitors + '</b><br>'+
          'Type:<b>' + this.point.type+ '</b><br>';
        }
      },
      series: series
    });

    return [hc, maxThresholdValue];
  }
}

function getScatterPageHS(initData) {
  var generatedDataValue = generatePageData(initData);
  getThreshold(generatedDataValue[0], generatedDataValue[1]);

  function getThreshold(hcValue, pageValue) {
    var cr = pageValue;

    switch(cr) {
      case 3:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'dash',
          value: 3,
          color: '#ffff4d',
          width: 2,
          id: 'plot-line-1',
          label: {
            text: "Target = 3.0 sec",
            style: {
              color: '#ffff4d'
            }
          }
        });
        break;
      case 5:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'dash',
          value: 5,
          color: '#ffff4d',
          width: 2,
          id: 'plot-line-1',
          label: {
            text: "Target = 5.0 sec",
            style: {
              color: '#ffff4d'
            }
          }
        });
        break;
      case 8:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'dash',
          value: 8,
          color: '#ffff4d',
          width: 2,
          id: 'plot-line-1',
          label: {
            text: "Target = 8.0 sec",
            style: {
              color: '#ffff4d'
            }
          }
        });
        break;
      default:
        break;
    }
  }

  function generatePageData(initData) {
    var series = [],
    pageNameObj = initData.maxPageName;

      for(i = 0; i < pageNameObj.length; i++) {
        var dataX = parseFloat(pageNameObj[i].totaluniquevisitor, 10),
        dataY = parseFloat(pageNameObj[i].max, 10),
        iconColor = 'rgba(0,175,80,0.5)',
        pageType = 'rarely',
        pageTypeVal = 0,
        iconShape = 'circle',
        serviceTier = pageNameObj[i].servicetier,
        maxThresholdValue = 3;

        if(dataY > 3) {
          iconColor = 'rgba(255,0,34,0.5)';
        }

        if(pageTypeValue == pageNameObj[i].type) {
          series.push({
            name: pageNameObj[i].pagename,
            color: iconColor,
            data: [{
              x: dataX,
              y: dataY,
              portfolio: pageNameObj[i].portfolio,
              md: pageNameObj[i].md,
              areaLead: pageNameObj[i].lead,
              opMd: pageNameObj[i].manager,
              serviceTier: pageNameObj[i].servicetier,
              maxPageLoad: pageNameObj[i].max,
              totalPageVisits:pageNameObj[i].hits,
              totalUniqueVisitors: pageNameObj[i].totaluniquevisitor,
              type: pageNameObj[i].type,
              application: pageNameObj[i].appid + ' - ' + pageNameObj[i].appname,
              status: pageNameObj[i].max > 3 ? 'Above 3s threshold' : 'Below 3s threshold'
            }],
            marker: {
              symbol: 'circle'
            }
          });
        }
      }
      
      var hc = Highcharts.chart('opt-scatterPage', {
        chart: {
          type: 'scatter',
          zoomType: 'xy'
        },
        title: {
          text: ''
        },
        subtitle: {
          text: ''
        },
        xAxis: {
          min: 0,
          title: {
            enabled: true,
            text: 'Unique Visitor'
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true,
          min: 0
        },
        yAxis: {
          gridLineColor: '#1b1b1b',
          type: 'logarithmic',
          title: {
            text: 'Max Page Load'
          }
        },
        legend: {
          enabled: false,
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 370,
          y: 200,
          floating: true,
          backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
          borderWidth: 1
        },
        plotOptions: {
          scatter: {
            marker: {
              symbol: 'circle',
              radius: 4,
              states: {
                hover: {
                  enabled: true,
                  lineColor: 'rgb(100,100,100)'
                }
              }
            },
            states: {
              hover: {
                marker: {
                  enabled: false
                }
              }
            },
          }
        },
        tooltip: {
          headerFormat: '',
          formatter: function() {
            return '<b>' + this.series.name + '</b><br>' +
            'Max Pageload(sec): <b>' + this.point.maxPageLoad + '</b><br>' +
            'Status: <b>' + this.point.status + '</b><br>' +
            'Total Page Hits: <b>' + this.point.totalPageVisits + '</b><br>' +
            'Total Unique Visitors: <b>' + this.point.totalUniqueVisitors + '</b><br>' +
            '----------------------------------------<br>' +
            'Application: <b>' + this.point.application + '</b><br>' +
            'Portfolio:<b>' + this.point.portfolio + '</b><br>' +
            'Managing Director:<b>' + this.point.md + '</b><br>' +
            'Operations Manager:<b>' + this.point.opMd + '</b><br>' +
            'Area Lead:<b>' + this.point.areaLead + '</b><br>' +
            'Service Tier:<b>' + this.point.serviceTier + '</b><br>' +
            'Type:<b>' + this.point.type+ '</b><br>';
          }
        },
        series: series
      });

      return [hc, maxThresholdValue];
    }
  }

function getMapHS(initData, filterValue) {
  var data = [];

  for (i = 0; i < initData.length; i++) {
    if(initData[i].country && (initData[i].type == pageTypeValue) && (!filterValue || initData[i].appid == filterValue)) {
      data.push({
        color: initData[i]. max > 3 ? '#FF0022' : '#00af50',
        country: initData[i].country,     
        countryCode: initData[i].countrycode,
        totalPageVisits: initData[i].totalPageVisit,
        totalUniqueVisitors: initData[i].totaluniquevisitor,
        application: initData[i].appid + ' - ' + initData[i].appname,
        status: initData[i]. max > 3 ? 'Greater than 3s threshold' : 'Below 3s threshold',
        pageName: initData[i].pagename,
        pageLoad: initData[i]. max,
        z: initData[i].totaluniquevisitor
      });
    }
  }

  Highcharts.mapChart('opt-maps', {
    chart: {
      map: 'custom/world'
    },
    title: {
      text: ''
    },
    subtitle: {
      text: ''
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: 'bottom'
      }
    },
    tooltip: {
      useHTML: true,
      formatter: function() {
        return '<b>' + this.point.country + '</b><br>' +
        'Total Page Hits:<b>' + this.point.totalPageVisits + '</b><br>' +
        'Total Unique Visitors:<b>' + this.point.totalUniqueVisitors + '</b><br>' +
        '----------------------------------------<br>' +
        'Application:<b>' + this.point.application + '</b><br>' +
        'Max Pageload(sec):<b>' + this.point.pageLoad + '</b><br>' +
        'Status:<b>' + this.point.status + '</b><br>' +
        'Page:<b>' + this.point.pageName + '</b><br>';
      }
    },
    series: [{
      name: 'Countries',
      color: '#E0E0E0',
      enableMouseTracking: false
    }, {
      type: 'mapbubble',
      joinBy: ['iso-a2', 'countryCode'],
      data: data,
      name: 'Total Page Visits:',
      minSize: 4,
      maxSize: 10
    }]
  });
}

function getFilterData(appName) {
  var getAppNameFilter = document.getElementById('opt-appName');
  for(i = 1; i < appName.length; i++) {
    getAppNameFilter.options[i] = null;
  }

  for(i = 0; i < appName.length; i++) {
    if(appName[i].type == document.getElementById('opt-pageType').value) {
      var optionAN = document.createElement('option');
      optionAN.innerHTML = appName[i].appname;
      optionAN.value = appName[i].appid;
      getAppNameFilter.appendChild(optionAN);
    }
  }
}

window.onload = function() {
  document.getElementById('opt-appName').onchange = function() {
    var filterValue = this.value,
    getContainer = document.getElementById('opt-container'),
    getOptWeekContainer = document.getElementById('opt-container2'),
    getScatter1 = document.getElementById('opt-scatter'),
    getScatter2 = document.getElementById('opt-scatter2'),
    getScatterPage1 = document.getElementById('opt-scatterPage'),
    getScatterPage2 = document.getElementById('opt-scatterPage2');
    
    if(filterValue == 'all') {
      getContainer.style.display = 'none';
      getOptWeekContainer.style.display = 'none';
      getScatter1.style.display = 'block';
      getScatterPage1.style.display = 'block';
      getScatter2.style.display = 'none';
      getScatterPage2.style.display = 'none';
      getScatterHS(initData);
    } else {
      getContainer.style.display = 'inline-flex';
      getOptWeekContainer.style.display = 'inline-flex';
      getScatter1.style.display = 'none';
      getScatterPage1.style.display = 'none';
      getScatter2.style.display = 'block';
      getScatterPage2.style.display = 'block';
      
      for(i = 0; i < initData.maxPageType.length; i++) {
        if(filterValue == initData.maxPageType[i].appid) {
          getScatterHS2(initData.maxPageType[i]);
        }
      }
      
      getScatterPageHS2(initData.maxPageName, filterValue);
      getMapHS(initData.totalVisitPerCountry, filterValue);
      getPageloadHS(initData.hourTime, filterValue);
      //getPageloadWeekHS(initData.daily, filterValue);
    }
  }
  
  document.getElementById('opt-pageType').onchange = function() {
    getScatterHS(initData);
    getScatterPageHS(initData);
    getMapHS(initData.totalVisitPerCountry);
    getFilterData(initData.maxPageType);
  }
  
}

function getScatterHS2(initData) {
  var generatedDataValue = generateData(initData);
    getThreshold(generatedDataValue[0], generatedDataValue[1]);

    function getThreshold(hcValue, pageValue) {
      var cr = pageValue;

      switch(cr) {
        case 3:
          hcValue.yAxis[0].addPlotLine({
            dashStyle: 'dash', 
            value: 3,
            color: '#ffff4d',
            width: 1,
            id: 'plot-line-1',
            label: {
              text: "Target = 3.0 sec",
              style: {
                color: '#ffff4d'
              }
            }
          });
          break;
        case 5:
          hcValue.yAxis[0].addPlotLine({
            dashStyle: 'dash',
            value: 5,
            color: '#ffff4d',
            width: 2,
            id: 'plot-line-1',
            label: {
              text: "Target = 5.0 sec",
              style: {
                color: '#ffff4d'
              }
            }
          });
          break;
        case 8:
          hcValue.yAxis[0].addPlotLine({
            dashStyle: 'dash',
            value: 8,
            color: '#ffff4d',
            width: 2,
            id: 'plot-line-1',
            label: {
              text: "Target = 8.0 sec",
              style: {
                color: '#ffff4d'
              }
            }
          });
          break;
      }
    }

    function generateData(dataToManipulate) {
      var series = [],
      pageTypeObj = dataToManipulate,
      dataX = parseFloat(pageTypeObj.totaluniquevisitor , 10),
      dataY = parseFloat(pageTypeObj.max , 10),
      iconColor = 'rgba(0,175,80,0.5)',
      pageType = 'rarely',
      pageTypeVal = 0,
      iconShape = 'circle',
      serviceTier = dataToManipulate.servicetier,
      maxThresholdValue = 0,
      serviceTier = '';

      if (serviceTier == 'Nearly Always On') {
        iconShape = 'triangle';
      }else if (serviceTier == 'Standard') {
        iconShape = 'circle';
      } else if (serviceTier == 'Always On') {
        iconShape = 'square';
      }
      maxThresholdValue = 3;
      if (dataY >= 3) {
        iconColor = 'rgba(255,0,34,0.5)';
      }
      
      series.push({
        name: pageTypeObj.appid  + ' - ' +pageTypeObj.appname,
        color: iconColor,
        data: [{
          x: dataX,
          y: dataY,
          portfolio: pageTypeObj.portfolio,
          md: pageTypeObj.md,
          areaLead: pageTypeObj.lead,
          opMd: pageTypeObj.manager,
          serviceTier: pageTypeObj.servicetier,
          maxPageLoad: pageTypeObj.max,
          totalPageVisits: pageTypeObj.hits,
          totalUniqueVisitors: pageTypeObj.totaluniquevisitor,
          type: pageTypeObj.type
        }],
        marker: {
          symbol: iconShape
        }
      });
      
      var hc = Highcharts.chart('opt-scatter2', {
        chart: {
          type: 'scatter',
          zoomType: 'xy',
          height: 250,
        },
        title: {
          text: ''
        },
        subtitle: {
          text: ''
        },
        xAxis: {
          
          min: 0,
          title: {
            enabled: true,
            text: 'Unique Visitor'
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true
        },
        yAxis: {
          gridLineColor: '#1b1b1b',
          type: 'logarithmic',
          title: {  
            text: 'Max Page Load'
          }
        },
        legend: {
          enabled: false,
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 370,
          y: 200,
          floating: true,
          backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
          borderWidth: 1
        },
        plotOptions: {
          scatter: {
            marker: {
              symbol: 'circle',
              radius: 5,
              states: {
                hover: {
                  enabled: true,
                  lineColor: 'rgb(100,100,100)'
                }
              }
            },
            states: {
              hover: {
                marker: {
                  enabled: false
                }
              }
            },
          }
        },
        tooltip: {
          headerFormat: '',
          formatter: function() {
            return '<b>' + this.series.name + '</b><br>' +
              'Portfolio:<b>' + this.point.portfolio + '</b><br>' +
              'Managing Director:<b>' + this.point.md + '</b><br>' +
              'Area Lead:<b>' + this.point.areaLead + '</b><br>' +
              'Operations Manager:<b>' + this.point.opMd + '</b><br>' +
              'Service Tier:<b>' + this.point.serviceTier + '</b><br>' +
              'Max Pageload(sec):<b>' + this.point.maxPageLoad + '</b><br>' +
              'Total Page Hits:<b>' + this.point.totalPageVisits + '</b><br>' +
              'Total Unique Visitors:<b>' + this.point.totalUniqueVisitors + '</b><br>'+
              'Type:<b>' + this.point.type+ '</b><br>';
          }
        },
        series: series
      });

      return [hc, maxThresholdValue];
    }
}

function getScatterPageHS2(initData, filterValue) {
  var generatedDataValue = generatePageData(initData, filterValue);
  getThreshold(generatedDataValue[0], generatedDataValue[1]);

  function getThreshold(hcValue, pageValue) {
    var cr = pageValue;

    switch(cr) {
      case 3:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'dash',
          value: 3,
          color: '#ffff4d',
          width: 2,
          id: 'plot-line-1',
          label: {
            text: "Target = 3.0 sec",
            style: {
              color: '#ffff4d'
            }
          }
        });
        break;
      case 5:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'dash',
          value: 5,
          color: '#ffff4d',
          width: 2,
          id: 'plot-line-1',
          label: {
            text: "Target = 5.0 sec",
            style: {
              color: '#ffff4d'
            }
          }
        });
        break;
      case 8:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'dash',
          value: 8,
          color: '#ffff4d',
          width: 2,
          id: 'plot-line-1',
          label: {
            text: "Target = 8.0 sec",
            style: {
              color: '#ffff4d'
            }
          }
        });
        break;
      default:
        break;
    }
  }

  function generatePageData(initData, filterValue) {
    var series = [],
    pageNameObj = initData;

    for(i = 0; i < pageNameObj.length; i++) {
      if(initData[i].appid == filterValue) {
        var dataX = parseFloat(pageNameObj[i].totaluniquevisitor, 10),
        dataY = parseFloat(pageNameObj[i].max, 10),
        iconColor = 'rgba(0,175,80,0.5)',
        pageType = 'rarely',
        pageTypeVal = 0,
        iconShape = 'circle',
        serviceTier = 'standard',
        maxThresholdValue = 3;

        if(dataY >= 3) {
          iconColor = 'rgba(255,0,34,0.5)';
        }

        series.push({
          name: pageNameObj[i].pagename,
          color: iconColor,
          data: [{
            x: dataX,
            y: dataY,
            portfolio: pageNameObj[i].portfolio,
            md: pageNameObj[i].md,
            areaLead: pageNameObj[i].lead,
            opMd: pageNameObj[i].manager,
            serviceTier: pageNameObj[i].servicetier,
            maxPageLoad: pageNameObj[i].max,
            totalPageVisits:pageNameObj[i].hits,
            totalUniqueVisitors: pageNameObj[i].totaluniquevisitor,
            type: pageNameObj[i].type,
            application: pageNameObj[i].appid + ' - ' + pageNameObj[i].appname,
            status: pageNameObj[i].max > 3 ? 'Above 3s threshold' : 'Below 3s threshold'
          }],
          marker: {
            symbol: 'circle'
          }
        });
      }
    }

    var hc = Highcharts.chart('opt-scatterPage2', {
      chart: {
        type: 'scatter',
        zoomType: 'xy'
      },
      title: {
        text: ''
      },
      subtitle: {
        text: ''
      },
      xAxis: {
        min: 0,
        title: {
          enabled: true,
          text: 'Unique Visitor'
        },
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true
      },
      yAxis: {
        gridLineColor: '#1b1b1b',
        type: 'logarithmic',
        title: {
          text: 'Max Page Load'
        }
      },
      legend: {
        enabled: false,
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'top',
        x: 370,
        y: 200,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
        borderWidth: 1
      },
      plotOptions: {
        scatter: {
          marker: {
            symbol: 'circle',
            radius: 4,
            states: {
              hover: {
                enabled: true,
                lineColor: 'rgb(100,100,100)'
              }
            }
          },
          states: {
            hover: {
              marker: {
                enabled: false
              }
            }
          },
        }
      },
      tooltip: {
        headerFormat: '',
        formatter: function() {
          return '<b>' + this.series.name + '</b><br>' +
          'Max Pageload(sec): <b>' + this.point.maxPageLoad + '</b><br>' +
          'Status: <b>' + this.point.status + '</b><br>' +
          'Total Page Hits: <b>' + this.point.totalPageVisits + '</b><br>' +
          'Total Unique Visitors: <b>' + this.point.totalUniqueVisitors + '</b><br>' +
          '----------------------------------------<br>' +
          'Application: <b>' + this.point.application + '</b><br>' +
          'Portfolio:<b>' + this.point.portfolio + '</b><br>' +
          'Managing Director:<b>' + this.point.md + '</b><br>' +
          'Operations Manager:<b>' + this.point.opMd + '</b><br>' +
          'Area Lead:<b>' + this.point.areaLead + '</b><br>' +
          'Service Tier:<b>' + this.point.serviceTier + '</b><br>' +
          'Type:<b>' + this.point.type+ '</b><br>';
        }
      },
      series: series
    });
    return [hc, maxThresholdValue];
  }
}

getData();