const ALL = 'all';

var last7DaysArr = [],
hoursGenArr =[], hh, initData = {},
thresholdTarget = 3,
applicationFilterValue = ALL,
portfolioFilterValue = ALL,
managingDirectorFilterValue = ALL,
leadFilterValue = ALL,
managerFilterValue = ALL,
serviceTierFilterValue = ALL,
pageTypeFilterValue = document.getElementById('opt-pageType').value,
aggregationFilterValue = document.getElementById('opt-aggregation').value;

function getData() {
  sendReq("query/appDataGet.php", function processResponse(response) {
	initData.maxPageType = JSON.parse(response);
	console.log(initData);
	getScatterHS();
	getFilterData(initData.maxPageType);
  });
  sendReq("query/mapDataGet.php", function processResponse(response) {
    initData.totalVisitPerCountry = JSON.parse(response);
    console.log(initData);
    getMapHS();
  });
  sendReq("query/pageDataGet.php", function processResponse(response) {
    initData.maxPageName = JSON.parse(response);
    console.log(initData);
    getScatterPageHS();
  });
  sendReq("query/hourlyDataGet.php", function processResponse(response) {
    initData.hourTime = JSON.parse(response);
    console.log(initData);
    if (ALL != applicationFilterValue) {
      getPageloadHS();
    }
  });
  sendReq("query/dailyDataGet.php", function processResponse(response) {
    initData.daily = JSON.parse(response);
    console.log(initData);
    if (ALL != applicationFilterValue) {
      getPageloadWeekHS();
    }
  });
  updateClock();
  setLast7Days();
  setPast24Hours();
  //removeLoader();
}

function sendReq(url, callbackFunction) {
  var xmlhttp;
  if (window.ActiveXObject) {
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  } else if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } 
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == '200') {
      if (callbackFunction) callbackFunction(xmlhttp.responseText);
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function removeLoader() {
  var getLoader = document.getElementsByClassName('operations-loader');
  
  for(i = 0; i < getLoader.length; i++) {
    getLoader[i].style.display = 'none';
  }
}

function formatDate(date) {
  var dd = date.getDate();
  var mm = date.getMonth() + 1;
  var yyyy = date.getFullYear();
  if ( dd < 10 ) { dd = '0' + dd }
  if ( mm < 10 ) { mm = '0' + mm }
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
  ctr = 0, hrCnt = 0, i;
  
  hh = d.getHours() - 8;
  hh = hh < 0 ? 24 + hh : hh;
  
  for (i = hh; i < 24; i++) {
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
  }
  
  if(hours < 10) {
      hours = '0' + hours;
  }

  if(dd < 10) {
      dd = '0'+ dd;
  }

  if(mm < 10 ) {
      mm = '0' + mm;
  }

  var today = mm + '/' + dd + '/' + yyyy,
  time = hours + ':' + minutes;

  document.getElementById('time').innerHTML = [today, time].join(' ');
  setTimeout(updateClock, 30000);
}

function getPageloadHS() {
  var highchartData = [],
  hourlyAppData = [],
  startHr, appDetails, i, ctr, yValue,
  hourlyData = initData.hourTime;
	
  for (i = 0; i < hourlyData.length; i++) {
    if(hourlyData[i].appid == applicationFilterValue && pageTypeFilterValue == hourlyData[i].type) {
      hourlyAppData.push(hourlyData[i]);
    }
  }
  i = 0;
  hrCnt = 0;
  hrCtr = 0;
  for (ctr = hh; ctr < 24; ctr++) {
    if (i < hourlyAppData.length && parseInt(hourlyAppData[i].hourtime) == ctr - hrCnt) {
      startHr = parseInt(hourlyAppData[i].hourtime) - hh;
      appDetails = getApplicationDetails(hourlyAppData[i].appid);
      yValue = getAggregationValue(hourlyAppData[i]);
      highchartData.push({
        x: startHr < 0 ? 24 + startHr : startHr,
        y: yValue,
        time: hourlyAppData[i].snapdate,
        pageHits: hourlyAppData[i].hits,
        uniqueVisitors: hourlyAppData[i].totaluniquevisitor,
        portfolio: appDetails.portfolio,
        managingDirector: appDetails.md,
        areaLead: appDetails.lead,
        operationsManager: appDetails.manager,
        serviceTier: appDetails.servicetier,
        application: hourlyAppData[i].appid + ' - ' + hourlyAppData[i].appname,
        pageName: hourlyAppData[i].pagename,
        color: yValue > thresholdTarget ? '#FF0022' : '#00af50'
      });
      i++;
    } else {
      startHr = ctr - hrCnt - hh;
      highchartData.push({
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
          x: -50,
          text: 'Previous day',
          //align: 'left',
          verticalAlign: 'top',
          textAlign: 'center',
          rotation: 0,
          style: {
            color: '#aaa'
          }
        }
      },{
        color: '#444',
        width: 1,
        value: 24 - hh - 0.5,
        dashStyle: 'Solid',
        label: {
          x: 10,
          text: 'Current day',
          verticalAlign: 'top',
          rotation: 0,
          style: {
            color: '#aaa'
          }
        }
      }]
    },
    yAxis: {
      minRange: thresholdTarget,
      min: 0,
      floor: 0,
      title: {
        text: 'Page Load'
      },
      labels: {
        format: '{value}s'
      },
      gridLineColor: '#111111',
      plotLines: [{
        color: '#ffff4d',
        width: 1,
        value: thresholdTarget,
        label: {
          text: 'Target = ' + thresholdTarget + '.0 sec',
          align: 'left',
          style: {
            color: '#ffff4d'
          }
        },
        dashStyle: 'Dash',
        zIndex: 3
      }]
    },
    tooltip: {
      formatter: function() {
        if (!this.point.pageName) {
          tooltipText = '<b>No Data</b>';
        } else {
          tooltipText = '<b>' + this.point.pageName + '</b><br>' +
                        'Time: <b>' + this.point.time + ' CST </b><br>' +
                        aggregationFilterValue + ' Pageload(sec): <b>' + this.point.y + '</b><br>' +
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
      data: highchartData,
      lineWidth: 1
    }]
  });
}

function getPageloadWeekHS() {
  var highchartData = [],
  dailyAppData = [],
  appDetails, i, ctr, yValue,
  dailyInitData = initData.daily;
  for (i = 0; i < dailyInitData.length; i++) {
    if(applicationFilterValue == dailyInitData[i].appid && pageTypeFilterValue == dailyInitData[i].type) {
      dailyAppData.push(dailyInitData[i]);
    }
  }
  i = 0;
  for (ctr = 0; ctr < 7; ctr++) {
    if (i < dailyAppData.length && dailyAppData[i].snapdate.split(' ')[0] == last7DaysArr[ctr]) {
      appDetails = getApplicationDetails(dailyAppData[i].appid);
      yValue = getAggregationValue(dailyAppData[i]);
      highchartData.push({
        x: ctr,
        y: yValue,
        time: dailyAppData[i].snapdate,
        pageHits: dailyAppData[i].hits,
        uniqueVisitors: dailyAppData[i].totaluniquevisitor,
        portfolio: appDetails.portfolio,
        managingDirector: appDetails.md,
        areaLead: appDetails.lead,
        operationsManager: appDetails.manager,
        serviceTier: appDetails.servicetier,
        application: dailyAppData[i].appid + ' - ' + appDetails.appname,
        pageName: dailyAppData[i].pagename,
        color: yValue > thresholdTarget ? '#FF0022' : '#00af50'
      });
      i++;
    } else {
      highchartData.push({
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
      minRange: thresholdTarget,
      min: 0,
      floor: 0,
      title: {
        text: 'Page Load'
      },
      labels: {
        format: '{value}s'
      },
      gridLineColor: '#111111',
      plotLines: [{
        color: '#ffff4d',
        width: 1,
        value: thresholdTarget,
        label: {
          text: 'Target = ' + thresholdTarget + '.0 sec',
          align: 'left',
          style: {
            color: '#ffff4d'
          }
        },
        dashStyle: 'Dash',
        zIndex: 3
      }]
    },
    tooltip: {
      formatter: function() {
        if (!this.point.pageName) {
          tooltipText = '<b>No Data</b>';
        } else {
          tooltipText = '<b>' + this.point.pageName + '</b><br>' +
                        'Time: <b>' + this.point.time + '</b><br>' +
                        aggregationFilterValue + ' Pageload(sec): <b>' + this.point.y + '</b><br>' +
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
      data: highchartData,
      lineWidth: 1
    }]
  });
}

function getScatterHS() {
  var generatedDataValue = generateData(initData);
  getThreshold(generatedDataValue[0], generatedDataValue[1]);

  function getThreshold(hcValue, pageValue) {
    var cr = pageValue;

    switch(cr) {
      case 3:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'Dash', 
          value: 3,
          color: '#ffff4d',
          width: 1,
          id: 'plot-line-1',
          label: {
            text: "Target = 3.0 sec",
            style: {
              color: '#ffff4d'
            }
          },
          zIndex: 3
        });
        break;
      case 5:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'Dash',
          value: 5,
          color: '#ffff4d',
          width: 1,
          id: 'plot-line-1',
          label: {
            text: "Target = 5.0 sec",
            style: {
              color: '#ffff4d'
            }
          },
          zIndex: 3
        });
        break;
      case 8:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'Dash',
          value: 8,
          color: '#ffff4d',
          width: 1,
          id: 'plot-line-1',
          label: {
            text: "Target = 8.0 sec",
            style: {
              color: '#ffff4d'
            }
          },
          zIndex: 3
        });
        break;
      default:
        break;
    }
  }

  function generateData(initData) {
    var series = [];
    for (i = 0; i < initData.maxPageType.length; i++) {
      var pageTypeObj = initData.maxPageType[i];
      if (isValidFilterData(initData.maxPageType[i]) && pageTypeFilterValue == pageTypeObj.type) {
        var dataX = parseFloat(pageTypeObj.totaluniquevisitor , 10),
        dataY = getAggregationValue(pageTypeObj),
        iconColor = 'rgba(0,175,80,0.5)',
        pageType = pageTypeFilterValue,
        pageTypeVal = 0,
        iconShape = 'circle',
        maxThresholdValue = thresholdTarget,
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

        if (dataY > thresholdTarget) {
          iconColor = 'rgba(255,0,34,0.5)';
        }
        series.push({
          name: pageTypeObj.appid  + ' - ' + pageTypeObj.appname,
          color: iconColor,
          data: [{
            x: dataX,
            y: dataY,
            portfolio: pageTypeObj.portfolio,
            md: pageTypeObj.md,
            areaLead: pageTypeObj.lead,
            opMd: pageTypeObj.manager,
            serviceTier: pageTypeObj.servicetier,
            maxPageLoad: dataY,
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
      lang: {
        noData: "No Data Available"
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
      	minRange: thresholdTarget,
      	//min: 0,
        gridLineColor: '#1b1b1b',
        type: 'logarithmic',
        title: {  
          text: 'Page Load'
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
          aggregationFilterValue + ' Pageload(sec):<b>' + this.point.maxPageLoad + '</b><br>' +
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
function getScatterPageHS() {
  var generatedDataValue = generatePageData(initData);
  getThreshold(generatedDataValue[0], generatedDataValue[1]);

  function getThreshold(hcValue, pageValue) {
    var cr = pageValue;

    switch(cr) {
      case 3:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'Dash',
          value: 3,
          color: '#ffff4d',
          width: 1,
          id: 'plot-line-1',
          label: {
            text: "Target = 3.0 sec",
            style: {
              color: '#ffff4d'
            }
          },
          zIndex: 3
        });
        break;
      case 5:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'Dash',
          value: 5,
          color: '#ffff4d',
          width: 1,
          id: 'plot-line-1',
          label: {
            text: "Target = 5.0 sec",
            style: {
              color: '#ffff4d'
            }
          },
          zIndex: 3
        });
        break;
      case 8:
        hcValue.yAxis[0].addPlotLine({
          dashStyle: 'Dash',
          value: 8,
          color: '#ffff4d',
          width: 1,
          id: 'plot-line-1',
          label: {
            text: "Target = 8.0 sec",
            style: {
              color: '#ffff4d'
            }
          },
          zIndex: 1
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
      dataY = getAggregationValue(pageNameObj[i]),
      iconColor = 'rgba(0,175,80,0.5)',
      pageType = 'rarely',
      pageTypeVal = 0,
      iconShape = 'circle',
      serviceTier = pageNameObj[i].servicetier,
      maxThresholdValue = thresholdTarget;

      if(dataY > thresholdTarget) {
        iconColor = 'rgba(255,0,34,0.5)';
      }

      if(isValidFilterData(pageNameObj[i]) && pageTypeFilterValue == pageNameObj[i].type) {
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
            maxPageLoad: dataY,
            totalPageVisits:pageNameObj[i].hits,
            totalUniqueVisitors: pageNameObj[i].totaluniquevisitor,
            type: pageNameObj[i].type,
            application: pageNameObj[i].appid + ' - ' + pageNameObj[i].appname,
            status: pageNameObj[i].max > thresholdTarget ? 'Above ' + thresholdTarget + 's threshold' : 'Below ' + thresholdTarget + 's threshold'
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
        minRange: thresholdTarget,
        //min: 0,
        gridLineColor: '#1b1b1b',
        type: 'logarithmic',
        title: {
          text: 'Page Load'
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
            aggregationFilterValue + ' Pageload(sec): <b>' + this.point.maxPageLoad + '</b><br>' +
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
  
function getMapHS() {
  var highchartData = [], pageloadValue,
  initMapData = initData.totalVisitPerCountry;
  for (i = 0; i < initMapData.length; i++) {
    if(initMapData[i].country && isValidFilterData(initMapData[i]) && pageTypeFilterValue == initMapData[i].type) {
      pageloadValue = getAggregationValue(initMapData[i]);
      highchartData.push({
        color: pageloadValue > thresholdTarget ? '#FF0022' : '#00af50',
        country: initMapData[i].country,			
        countryCode: initMapData[i].countrycode,
        totalPageVisits: initMapData[i].totalPageVisit,
        totalUniqueVisitors: initMapData[i].totaluniquevisitor,
        application: initMapData[i].appid + ' - ' + initMapData[i].appname,
        status: pageloadValue > thresholdTarget ? 'Above ' + thresholdTarget + 's threshold' : 'Below ' + thresholdTarget + 's threshold',
        pageName: initMapData[i].pagename,
        pageLoad: pageloadValue,
        z: initMapData[i].totaluniquevisitor
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
               aggregationFilterValue + ' Pageload(sec):<b>' + this.point.pageLoad + '</b><br>' +
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
      data: highchartData,
      name: 'Total Page Visits:',
      minSize: 4,
      maxSize: 10
    }]
  });
}

/*
 * date : 		6-20-2017
 * updated by : henri.l.valencia
 * purposes   : function getFilterData : added functionality for other dropdown filters to change 
 * 				the value dynamically on the data retrieved on query / selected filter/s
 */
function getFilterData(appName , filter) {
  clearDropdownFilterValues();

  var applicationNameHolder = [];
  var serviceTierHolder = [];
  var managerHolder = [];
  var leadHolder = [];
  var mdHolder = [];
  var portfolioHolder = [];
  var pageTypeHolder = [];
  var serviceTierDropdownOrigValue = [];
  var filteredServiceTierDropdownOrigValue = [];

  for(var i = 0; i < appName.length; i++) {
    //henri : this will filter out repeating values of application name - start
    if(jQuery.isEmptyObject(applicationNameHolder)){
      var getAppNameFilter = document.getElementById('opt-appName');
      var optionAN = document.createElement('option');
      optionAN.innerHTML = appName[i].appname;
      optionAN.value = appName[i].appid;
      getAppNameFilter.appendChild(optionAN);
      applicationNameHolder.push(appName[i].appid);
    } else {
      if(applicationNameHolder.indexOf(appName[i].appid) > -1){
        //console.log('in the array : ' + appName[i].appname)
      } else {
        var getAppNameFilter = document.getElementById('opt-appName');
        var optionAN = document.createElement('option');
        optionAN.innerHTML = appName[i].appname;
        optionAN.value = appName[i].appid;
        getAppNameFilter.appendChild(optionAN);
        applicationNameHolder.push(appName[i].appid);
      }
    }//henri : this will filter out repeating values of application name - end
      
    //henri : this will filter out repeating values of service tier - start
    if(jQuery.isEmptyObject(serviceTierHolder)){
      var getServiceTierFilter = document.getElementById('opt-servTier');
      var optionServiceTier = document.createElement('option');
      optionServiceTier.innerHTML = appName[i].servicetier;
      optionServiceTier.value = optionServiceTier.innerHTML;
      getServiceTierFilter.appendChild(optionServiceTier);
      serviceTierHolder.push(appName[i].servicetier);
    } else {
      if(serviceTierHolder.indexOf(appName[i].servicetier) > -1){
        //console.log('in the array : ' + appName[i].servicetier)
      } else {
        var getServiceTierFilter = document.getElementById('opt-servTier');
        var optionServiceTier = document.createElement('option');
        optionServiceTier.innerHTML = appName[i].servicetier;
        optionServiceTier.value = optionServiceTier.innerHTML;
        getServiceTierFilter.appendChild(optionServiceTier);
        serviceTierHolder.push(appName[i].servicetier);
      }
    }//henri : this will filter out repeating values of service tier - end
      
    //henri : this will filter out repeating values of manager - start
    if(jQuery.isEmptyObject(managerHolder)){
      var getManagerFilter = document.getElementById('opt-manager');
      var optionManager = document.createElement('option');
      optionManager.innerHTML = appName[i].manager;
      optionManager.value = optionManager.innerHTML;
      getManagerFilter.appendChild(optionManager);
      managerHolder.push(appName[i].manager);
    } else {
      if(managerHolder.indexOf(appName[i].manager) > -1){
        //console.log('in the array : ' + appName[i].manager)
      } else {
        var getManagerFilter = document.getElementById('opt-manager');
        var optionManager = document.createElement('option');
        optionManager.innerHTML = appName[i].manager;
        optionManager.value = optionManager.innerHTML;
        getManagerFilter.appendChild(optionManager);
        managerHolder.push(appName[i].manager);
      }
    } //henri : this will filter out repeating values of manager - end
    
    //henri : this will filter out repeating values of lead - start
    if(jQuery.isEmptyObject(leadHolder)){
      var getLeadFilter = document.getElementById('opt-lead');
      var optionLead = document.createElement('option');
      optionLead.innerHTML = appName[i].lead;
      optionLead.value = optionLead.innerHTML;
      getLeadFilter.appendChild(optionLead);
      leadHolder.push(appName[i].lead);
    } else {
      if(leadHolder.indexOf(appName[i].lead) > -1){
        //console.log('in the array : ' + appName[i].lead)
      } else {
        var getLeadFilter = document.getElementById('opt-lead');
        var optionLead = document.createElement('option');
        optionLead.innerHTML = appName[i].lead;
        optionLead.value = optionLead.innerHTML;
        getLeadFilter.appendChild(optionLead);
        leadHolder.push(appName[i].lead);
      }
    }//henri : this will filter out repeating values of lead - end		
    
    //henri : this will filter out repeating values of managing director - start
    if(jQuery.isEmptyObject(mdHolder)){
      var getMdFilter = document.getElementById('opt-manDirector');
      var optionMd = document.createElement('option');
      optionMd.innerHTML = appName[i].md;
      optionMd.value = optionMd.innerHTML;
      getMdFilter.appendChild(optionMd);
      mdHolder.push(appName[i].md);
    } else {
      if(mdHolder.indexOf(appName[i].md) > -1){
        //console.log('in the array : ' + appName[i].md)
      } else {
        var getMdFilter = document.getElementById('opt-manDirector');
        var optionMd = document.createElement('option');
        optionMd.innerHTML = appName[i].md;
        optionMd.value = optionMd.innerHTML;
        getMdFilter.appendChild(optionMd);
        mdHolder.push(appName[i].md);
      }
    } //henri : this will filter out repeating values of managing director - end
		
    //henri : this will filter out repeating values of portfolio - start
    if(jQuery.isEmptyObject(portfolioHolder)){
      var getPortfolioFilter = document.getElementById('opt-portfolio');
      var optionPortfolio = document.createElement('option');
      optionPortfolio.innerHTML = appName[i].portfolio;
      optionPortfolio.value = optionPortfolio.innerHTML;
      getPortfolioFilter.appendChild(optionPortfolio);
      portfolioHolder.push(appName[i].portfolio);
    } else {
      if(portfolioHolder.indexOf(appName[i].portfolio) > -1){
        //console.log('in the array : ' + appName[i].portfolio)
      } else {
        var getPortfolioFilter = document.getElementById('opt-portfolio');
        var optionPortfolio = document.createElement('option');
        optionPortfolio.innerHTML = appName[i].portfolio;
        optionPortfolio.value = optionPortfolio.innerHTML;
        getPortfolioFilter.appendChild(optionPortfolio);
        portfolioHolder.push(appName[i].portfolio);
      }
    }//henri : this will filter out repeating values of portfolio - end	
  }
} // end of the getFilterData function


/*
 * date : 		6-20-2017
 * updated by : henri.l.valencia
 * purposes   : function clearDropdownFilterValues : to remove the existing values of the dropdown filters
 * 				This was used to handle the repeating values of the dropdown filters
 */
function clearDropdownFilterValues(){
	
	document.getElementById('opt-portfolio').innerHTML = '<option value="all">(All)</option>';
	document.getElementById('opt-manDirector').innerHTML = '<option value="all">(All)</option>';
	document.getElementById('opt-lead').innerHTML = '<option value="all">(All)</option>';
	document.getElementById('opt-manager').innerHTML = '<option value="all">(All)</option>';
	document.getElementById('opt-servTier').innerHTML = '<option value="all">(All)</option>';
	document.getElementById('opt-appName').innerHTML = '<option value="all">(All)</option>';

} // end of clearDropdownFilterValues


/*
 * date : 		6-20-2017
 * updated by : henri.l.valencia
 * purposes   : function populateDropdownFilters : to create values of the dropdown filters
 * 				This was used to insert values of the dropdown filters
 */
function populateDropdownFilters(portfolio , md , lead , manager , serviceTier , application , pageType){

	$("select#opt-portfolio").val(portfolio); 
	$("select#opt-manDirector").val(md); 
	$("select#opt-lead").val(lead); 
	$("select#opt-manager").val(manager); 
	$("select#opt-servTier").val(serviceTier); 
	$("select#opt-appName").val(application); 
	$("select#pageType").val(pageType); 

} // end of populateDropdownFilters


/*
 * date : 		6-20-2017
 * updated by : henri.l.valencia
 * purposes   : function onclickFilterAction : functionality of the dropdown process
 * 				This was used to populate the charts
 */
function onclickFilterAction(filterName , filterValue){
  var maxPageTypeHolder = [];
  for(i = 0; i < initData.maxPageType.length; i++) {
    if (isValidFilterData(initData.maxPageType[i])) {
      maxPageTypeHolder.push(initData.maxPageType[i]);
    }
  }
  getFilterData(maxPageTypeHolder);
  populateDropdownFilters(portfolioFilterValue , managingDirectorFilterValue, leadFilterValue, managerFilterValue, serviceTierFilterValue, applicationFilterValue, pageTypeFilterValue);
  getScatterHS();
  getMapHS();
  getScatterPageHS();
}

/*
 * date : 		6-20-2017
 * updated by : henri.l.valencia
 * purposes   : added the Id's of every filters to trigger the onclickFilterAction metho: functionality of the dropdown process
 * 				was triggered here
 */
window.onload = function() {
  document.getElementById('opt-appName').onchange = function() {
    applicationFilterValue = this.value;
    var getContainer = document.getElementById('opt-container'),
    getOptWeekContainer = document.getElementById('opt-container2');

    onclickFilterAction('appid' , applicationFilterValue);
    if (ALL == applicationFilterValue) {
      getContainer.style.display = 'none';
      getOptWeekContainer.style.display = 'none';
    } else {
      getContainer.style.display = 'inline-flex';
      getOptWeekContainer.style.display = 'inline-flex';
      if (initData.hourTime) {
        getPageloadHS();
      }
      if (initData.daily) {
        getPageloadWeekHS();
      }
    }
  }
  
  document.getElementById('opt-portfolio').onchange = function() {
    portfolioFilterValue = this.value;
    onclickFilterAction('portfolio' , portfolioFilterValue);
  }
	
  document.getElementById('opt-manDirector').onchange = function() {
    managingDirectorFilterValue = this.value;
    onclickFilterAction('md' , managingDirectorFilterValue);
  }
	
  document.getElementById('opt-lead').onchange = function() {
    leadFilterValue = this.value;
    onclickFilterAction('lead' , leadFilterValue);	
  }
	
  document.getElementById('opt-manager').onchange = function() {
    managerFilterValue = this.value;
    onclickFilterAction('manager' , managerFilterValue);	
  }

  document.getElementById('opt-servTier').onchange = function() {
    serviceTierFilterValue = this.value;
    onclickFilterAction('servicetier' , serviceTierFilterValue);	
  }
  
  document.getElementById('opt-pageType').onchange = function() {
    pageTypeFilterValue = this.value;

    thresholdTarget = pageTypeFilterValue == 'Mostly' ? 3 : pageTypeFilterValue == 'Commonly' ? 5 : pageTypeFilterValue == 'Rarely' ? 8 : 3; 
    var appTitle = document.getElementsByClassName('operations-app-title-p');
    for(i = 0; i < appTitle.length; i++) {
      appTitle[i].innerHTML = pageTypeFilterValue + ' Used Pages';
    }
    if(ALL != applicationFilterValue) {
      if (initData.hourTime) {
        getPageloadHS();
      }
      if (initData.daily) {
        getPageloadWeekHS();
      }
    }
    getScatterHS();
    getMapHS();
    getScatterPageHS();

  }
  
  document.getElementById('opt-aggregation').onchange = function() {
    aggregationFilterValue = this.value;
    document.getElementById('hourly-app-title').innerHTML = 'Hourly ' + aggregationFilterValue + ' Pageload Overtime';
    document.getElementById('daily-app-title').innerHTML = 'Daily ' + aggregationFilterValue + ' Pageload Overtime';
    document.getElementById('page-app-title').innerHTML = aggregationFilterValue + ' Pageload Per Visit';
    if(ALL != applicationFilterValue) {
      if (initData.hourTime) {
        getPageloadHS();
      }
      if (initData.daily) {
        getPageloadWeekHS();
      }
    }
    getScatterHS();
    getScatterPageHS();
    getMapHS();
  }
}

function getApplicationDetails(appId) {
  var appDetails = [], appData, i;
  for (i = 0; i < initData.maxPageType.length; i++) {
    appData = initData.maxPageType[i];
    if (appData.appid == appId) {
      appDetails.appname = appData.appname;
      appDetails.portfolio = appData.portfolio;
      appDetails.md = appData.md;
      appDetails.lead = appData.lead;
      appDetails.manager = appData.manager;
      appDetails.servicetier = appData.servicetier;
      break;
    }
  }
  return appDetails;
}

function getAggregationValue(data) {
  return aggregationFilterValue == '90th Percentile' ? parseFloat(data.percentile90th) : 
         aggregationFilterValue == 'Maximum' ? parseFloat(data.max) : 
         aggregationFilterValue == 'Minimum' ? parseFloat(data.min) : 
         aggregationFilterValue == 'Average' ? parseFloat(data.avg) : 0;
}

function isValidFilterData(data) {
  var isValid = false;
  if ((ALL == applicationFilterValue || data.appid == applicationFilterValue) && 
      (ALL == portfolioFilterValue || data.portfolio == portfolioFilterValue) && 
      (ALL == managingDirectorFilterValue || data.md == managingDirectorFilterValue) && 
      (ALL == leadFilterValue || data.lead == leadFilterValue) && 
      (ALL == managerFilterValue || data.manager == managerFilterValue) && 
      (ALL == serviceTierFilterValue || data.servicetier == serviceTierFilterValue)) {
    isValid = true;
  }
  return isValid;
}

getData();