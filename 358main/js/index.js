const ALL = '(All)';

var hcMap, hcScatterApp, hcScatterPage, hcLineHourlyPage, hcLineDailyPage, selectedApp = '',
last7DaysArr = [],
hoursGenArr =[], hh, initData = {},
thresholdTarget = 3,
expanded = false,
latestExpandedFilter = '',
isBodyClicked = false,
isAllOptionClicked = false,
portfolioFilterValues = [],
managingDirectorFilterValues = [],
leadFilterValues = [],
managerFilterValues = [],
serviceTierFilterValues = [],
applicationFilterValues = [],
pageTypeFilterValue = document.getElementById('opt-pageType').value,
aggregationFilterValue = document.getElementById('opt-aggregation').value;

function getData() {
  document.body.style.pointerEvents = 'none';
  sendReq("query/appdataget.php", function processResponse(response) {
    initData.maxPageType = JSON.parse(response);
    initAllFilterOptions();
    document.body.style.pointerEvents = 'auto';
    initHighchartScatterApp();
    updateScatterApp();
  });
  sendReq("query/mapdataget.php", function processResponse(response) {
    initData.totalVisitPerCountry = JSON.parse(response);
    initHighchartMap();
    updateMap();
  });
  sendReq("query/pagedataget.php", function processResponse(response) {
    initData.maxPageName = JSON.parse(response);
    initHighchartScatterPage();
    updateScatterPage();
  });
  sendReq("query/hourlydataget.php", function processResponse(response) {
    initData.hourTime = JSON.parse(response);
    setPast24Hours();
    initHighchartHourlyPageload();
    if (selectedApp != '' || applicationFilterValues.length == 1) updateHourlyPageload();
  });
  sendReq("query/dailydataget.php", function processResponse(response) {
    initData.daily = JSON.parse(response);
  	setLast7Days();
    initHighchartDailyPageload();
    if (selectedApp != '' || applicationFilterValues.length == 1) updateDailyPageload();
    console.log(initData);
  });
  updateClock();
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

/* 6-23-17
 * updated by: henri.l.valencia
 * commented out updateClock function, original code.
 * this should be removed after cst testing

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

*/

/*
 * 6-23-17
 * updated by: henri.l.valencia
 * fixes for CST 
 * 
 */
function updateClock() {

    var d = new Date();
    //set the offset
    var utcOffset = -7;
    //get utc
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    
    //create new date adjusting by the utcOffset to get local date/time
    var localDate = new Date(utc + (3600000 * (utcOffset+1)));
    var timeValue = localDate.toLocaleString('en-US', { hour12: false }).replace(/\,/g,"");
    timeValue = timeValue.slice(0, -3);

  	document.getElementById('time').innerHTML = timeValue + " CST";
  	setTimeout(updateClock, 30000);
}

function initHighchartScatterApp() {
  hcScatterApp = Highcharts.chart('opt-scatter', {
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
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    xAxis: {
      min: 0,
      title: {
        text: 'Unique Visitor',
      },
      startOnTick: true,
      endOnTick: true,
      showLastLabel: true
    },
    yAxis: {
      minRange: thresholdTarget,
      type: 'logarithmic',
      title: {  
        text: 'Page Load'
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
    plotOptions: {
      scatter: {
        marker: {
          radius: 5,
          lineWidth: 1,
          lineColor: '#b7b7b7'
        }
      }
    },
    tooltip: {
      headerFormat: '',
      formatter: function() {
        return '<b>' + this.point.appid + ' - ' + this.point.appname + '</b><br>' +
               'Portfolio:<b>' + this.point.portfolio + '</b><br>' +
               'Managing Director:<b>' + this.point.md + '</b><br>' +
               'Area Lead:<b>' + this.point.areaLead + '</b><br>' +
               'Operations Manager:<b>' + this.point.opMd + '</b><br>' +
               'Service Tier:<b>' + this.point.serviceTier + '</b><br>' +
               aggregationFilterValue + ' Pageload(sec):<b>' + this.point.y + '</b><br>' +
               'Total Page Hits:<b>' + this.point.totalPageVisits + '</b><br>' +
               'Total Unique Visitors:<b>' + this.point.totalUniqueVisitors + '</b><br>'+
               'Type:<b>' + this.point.type+ '</b><br>';
      }
    },
    series: [{
      data: [],
      cursor: 'pointer',
      allowPointSelect: true,
      point: {
      	events: {
          select: function () {
          	if (applicationFilterValues.length > 1) {
          	  var hcPoints = this.series.data, pointSelected = this;
          	  for(var i = 0; i < hcPoints.length; i++) {
          	    hcPoints[i].update({marker: {fillColor: Highcharts.Color(hcPoints[i].color).setOpacity(0.1).get()}});
              }
              this.update({marker: {radius:15, states: {select: {fillColor: Highcharts.Color(this.color).setOpacity(1).get(),lineWidth:1, lineColor: '#b7b7b7'}}}});
              selectedApp = this.appname;
              if (initData.hourTime) updateHourlyPageload();
              if (initData.daily) updateDailyPageload();
              document.getElementById('opt-container').style.display = 'inline-flex';
              document.getElementById('opt-container2').style.display = 'inline-flex';
              updateMap();
              updateScatterPage();
            }
          },
          unselect: function () {
          	if (selectedApp == this.appname && applicationFilterValues.length > 1) {
          	  var hcPoints = this.series.data;
          	  for(var i = 0; i < hcPoints.length; i++) {
          	    hcPoints[i].update({marker: {fillColor: Highcharts.Color(hcPoints[i].color).setOpacity(0.5).get()}});
          	  }
          	  this.update({marker: {radius:5}});
          	  selectedApp = '';
          	  document.getElementById('opt-container').style.display = 'none';
              document.getElementById('opt-container2').style.display = 'none';
              updateMap();
              updateScatterPage();
          	}
          }
        }
      }
    }]
  });
}

function initHighchartMap() {
  hcMap = Highcharts.mapChart('opt-maps', {
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
      data: [],
      name: 'Total Page Visits:',
      minSize: 4,
      maxSize: 10
    }]
  });
}

function initHighchartScatterPage() {
  hcScatterPage = Highcharts.chart('opt-scatterPage', {
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
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    xAxis: {
      min: 0,
      title: {
        text: 'Unique Visitor'
      },
      startOnTick: true,
      endOnTick: true,
      showLastLabel: true
    },
    yAxis: {
      minRange: thresholdTarget,
      type: 'logarithmic',
      title: {
        text: 'Page Load'
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
    plotOptions: {
      scatter: {
        marker: {
          radius: 5,
          lineWidth: 1,
          lineColor: '#b7b7b7'
        }
      }
    },
    tooltip: {
      headerFormat: '',
      formatter: function() {
        return '<b>' + this.point.pagename + '</b><br>' +
               aggregationFilterValue + ' Pageload(sec): <b>' + this.point.y + '</b><br>' +
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
    series: [{
      data: []
    }]
  });
}

function initHighchartHourlyPageload() {
  hcLineHourlyPage = Highcharts.chart('opt-pageLoad', {
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
      data: [],
      lineWidth: 1
    }]
  });
}

function initHighchartDailyPageload() {
  hcLineDailyPage = Highcharts.chart('opt-pageLoad-week', {
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
      data: [],
      lineWidth: 1
    }]
  });
}

function updateScatterApp() {
  var highchartData = [], pageLoadValue, i,
  pageTypeObj = initData.maxPageType;
  for (i = 0; i < pageTypeObj.length; i++) {
    if (pageTypeFilterValue == pageTypeObj[i].type && isValidFilterData(pageTypeObj[i])) {
      pageLoadValue = getAggregationValue(pageTypeObj[i]);
      highchartData.push({
        x: parseInt(pageTypeObj[i].totaluniquevisitor),
        y: pageLoadValue,
      	appid: pageTypeObj[i].appid,
        appname: pageTypeObj[i].appname,
        portfolio: pageTypeObj[i].portfolio,
        md: pageTypeObj[i].md,
        areaLead: pageTypeObj[i].lead,
        opMd: pageTypeObj[i].manager,
        serviceTier: pageTypeObj[i].servicetier,
        totalPageVisits: pageTypeObj[i].hits,
        totalUniqueVisitors: pageTypeObj[i].totaluniquevisitor,
        type: pageTypeObj[i].type,
        appname: pageTypeObj[i].appname,
        color: pageLoadValue > thresholdTarget ? 'rgba(255,0,34,0.5)' : 'rgba(0,175,80,0.5)',
        marker: { symbol: pageTypeObj[i].servicetier == 'Always On' ? 'square' : pageTypeObj[i].servicetier == 'Nearly Always On' ? 'triangle' : 'circle'}
      });
    }
  }
  hcScatterApp.series[0].setData([]);
  hcScatterApp.series[0].setData(highchartData, false);
  hcScatterApp.update({title: {text: highchartData.length > 0 ? '' : 'No Data'}}, false);
  hcScatterApp.yAxis[0].update({
    minRange: thresholdTarget,
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
      zIndex: 1}]}, false);
  hcScatterApp.redraw();
}

function updateScatterPage() {
  var highchartData = [], pageloadValue, i
  pageNameObj = initData.maxPageName;

  for(i = 0; i < pageNameObj.length; i++) {
    if(pageTypeFilterValue == pageNameObj[i].type && isValidFilterData(pageNameObj[i])) {
      pageloadValue = getAggregationValue(pageNameObj[i]);
      highchartData.push({
      	x: parseInt(pageNameObj[i].totaluniquevisitor),
      	y: pageloadValue,
        pagename: pageNameObj[i].pagename,
        portfolio: pageNameObj[i].portfolio,
        md: pageNameObj[i].md,
        areaLead: pageNameObj[i].lead,
        opMd: pageNameObj[i].manager,
        serviceTier: pageNameObj[i].servicetier,
        totalPageVisits:pageNameObj[i].hits,
        totalUniqueVisitors: pageNameObj[i].totaluniquevisitor,
        type: pageNameObj[i].type,
        application: pageNameObj[i].appid + ' - ' + pageNameObj[i].appname,
        status: pageloadValue > thresholdTarget ? 'Above ' + thresholdTarget + 's threshold' : 'Below ' + thresholdTarget + 's threshold',
        color: pageloadValue > thresholdTarget ? 'rgba(255,0,34,0.5)' : 'rgba(0,175,80,0.5)'
      });
    }
  }
  hcScatterPage.series[0].setData([]);
  hcScatterPage.series[0].setData(highchartData, false);
  hcScatterPage.update({title: {text: highchartData.length > 0 ? '' : 'No Data'}}, false);
  hcScatterPage.yAxis[0].update({
    minRange: thresholdTarget,
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
      zIndex: 1}]}, false);
  hcScatterPage.redraw();
}

function updateMap() {
  var highchartData = [], pageloadValue,
  initMapData = initData.totalVisitPerCountry;
  for (i = 0; i < initMapData.length; i++) {
    if (initMapData[i].country && pageTypeFilterValue == initMapData[i].type && isValidFilterData(initMapData[i])) {
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
  hcMap.series[1].setData([]);
  hcMap.series[1].setData(highchartData);
}

function updateHourlyPageload() {
  var highchartData = [],
  hourlyAppData = [],
  startHr, appDetails, i, ctr, yValue,
  hourlyData = initData.hourTime;
	
  for (i = 0; i < hourlyData.length; i++) {
    if(pageTypeFilterValue == hourlyData[i].type && ((selectedApp == '' && hourlyData[i].appname == applicationFilterValues[0]) || selectedApp == hourlyData[i].appname)) {
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
  hcLineHourlyPage.series[0].setData(highchartData, false);
  hcLineHourlyPage.yAxis[0].update({
      minRange: thresholdTarget,
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
    }, false);
  hcLineHourlyPage.redraw();
}

function updateDailyPageload() {
  var highchartData = [],
  dailyAppData = [],
  appDetails, i, ctr, yValue,
  dailyInitData = initData.daily;
  for (i = 0; i < dailyInitData.length; i++) {
    if(pageTypeFilterValue == dailyInitData[i].type && 
      ((selectedApp == '' && applicationFilterValues[0] == dailyInitData[i].appname) || 
      selectedApp == dailyInitData[i].appname)) {
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
  hcLineDailyPage.series[0].setData(highchartData, false);
  hcLineDailyPage.yAxis[0].update({
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
    }, false);
  hcLineDailyPage.redraw();
}

window.onload = function() {
  document.body.onclick = function() {
  	this.style.pointerEvents = 'none';
  	bodyOnClickEvent(latestExpandedFilter);
    isBodyClicked = true;
    this.style.pointerEvents = 'auto';
  }
  document.getElementById('opt-appName-box').onclick = function() {
    selectBoxOnClickEvent("opt-appName-options");
    latestExpandedFilter = 'opt-appName-options';
  }
  document.getElementById('opt-appName-options').onclick = function() {
    optionsOnClickEvent('opt-appName', this.childNodes, applicationFilterValues);
    updateHighCharts();
  }
  document.getElementById('opt-appName-options').firstChild.onclick = function() {
  	optionAllOnClickEvent('opt-appName', this.parentNode.childNodes, applicationFilterValues);
  }
  document.getElementById('opt-portfolio-box').onclick = function() {
    selectBoxOnClickEvent("opt-portfolio-options");
  	latestExpandedFilter = 'opt-portfolio-options';
  }
  document.getElementById('opt-portfolio-options').onclick = function() {
    optionsOnClickEvent('opt-portfolio', this.childNodes, portfolioFilterValues);
    updateAllFilterOptions(true, true, true, true, true);
    updateHighCharts();
  }
  document.getElementById('opt-portfolio-options').firstChild.onclick = function() {
  	optionAllOnClickEvent('opt-portfolio', this.parentNode.childNodes, portfolioFilterValues)
  }
  document.getElementById('opt-manDirector-box').onclick = function() {
    selectBoxOnClickEvent("opt-manDirector-options");
  	latestExpandedFilter = 'opt-manDirector-options';
  }
  document.getElementById('opt-manDirector-options').onclick = function() {
    optionsOnClickEvent('opt-manDirector', this.childNodes, managingDirectorFilterValues);
    updateAllFilterOptions(false, true, true, true, true);
    updateHighCharts();
  }
  document.getElementById('opt-manDirector-options').firstChild.onclick = function() {
  	optionAllOnClickEvent('opt-manDirector', this.parentNode.childNodes, managingDirectorFilterValues);
  }
  document.getElementById('opt-lead-box').onclick = function() {
    selectBoxOnClickEvent("opt-lead-options");
  	latestExpandedFilter = 'opt-lead-options';
  }
  document.getElementById('opt-lead-options').onclick = function() {
    optionsOnClickEvent('opt-lead', this.childNodes, leadFilterValues);
    updateAllFilterOptions(false, false, true, true, true);
    updateHighCharts();
  }
  document.getElementById('opt-lead-options').firstChild.onclick = function() {
  	optionAllOnClickEvent('opt-lead', this.parentNode.childNodes, leadFilterValues);
  }
  document.getElementById('opt-manager-box').onclick = function() {
    selectBoxOnClickEvent("opt-manager-options");
  	latestExpandedFilter = 'opt-manager-options';
  }
  document.getElementById('opt-manager-options').onclick = function() {
    optionsOnClickEvent('opt-manager', this.childNodes, managerFilterValues);
    updateAllFilterOptions(false, false, false, true, true);
    updateHighCharts();
  }
  document.getElementById('opt-manager-options').firstChild.onclick = function() {
  	optionAllOnClickEvent('opt-manager', this.parentNode.childNodes, managerFilterValues);
  }
  document.getElementById('opt-servTier-box').onclick = function() {
    selectBoxOnClickEvent("opt-servTier-options");
  	latestExpandedFilter = 'opt-servTier-options';
  }
  document.getElementById('opt-servTier-options').onclick = function() {
    optionsOnClickEvent('opt-servTier', this.childNodes, serviceTierFilterValues);
    updateAllFilterOptions(false, false, false, false, true);
    updateHighCharts();
  }
  document.getElementById('opt-servTier-options').firstChild.onclick = function() {
  	optionAllOnClickEvent('opt-servTier', this.parentNode.childNodes, serviceTierFilterValues);
  }
  document.getElementById('opt-pageType').onclick = function() {
    isBodyClicked = false;
    if (expanded && latestExpandedFilter != '') {
      selectBoxOnClickEvent(latestExpandedFilter);
      latestExpandedFilter = '';
    }
  }
  document.getElementById('opt-aggregation').onclick = function() {
  	isBodyClicked = false;
  	if (expanded && latestExpandedFilter != '') {
      selectBoxOnClickEvent(latestExpandedFilter);
      latestExpandedFilter = '';
  	}
  }
  document.getElementById('opt-pageType').onchange = function() {
    selectedApp = '';
    pageTypeFilterValue = this.value;
    thresholdTarget = pageTypeFilterValue == 'Mostly' ? 3 : pageTypeFilterValue == 'Commonly' ? 5 : pageTypeFilterValue == 'Rarely' ? 8 : 3; 
    var appTitle = document.getElementsByClassName('operations-app-title-p');
    for(i = 0; i < appTitle.length; i++) {
      appTitle[i].innerHTML = pageTypeFilterValue + ' Used Pages';
    }
    updateHighCharts();
  }
  document.getElementById('opt-aggregation').onchange = function() {
    selectedApp = '';
    aggregationFilterValue = this.value;
    document.getElementById('hourly-app-title').innerHTML = 'Hourly ' + aggregationFilterValue + ' Pageload Overtime';
    document.getElementById('daily-app-title').innerHTML = 'Daily ' + aggregationFilterValue + ' Pageload Overtime';
    document.getElementById('page-app-title').innerHTML = aggregationFilterValue + ' Pageload Per Visit';
    updateHighCharts();
  }
}

function updateHighCharts() {
  var getContainer = document.getElementById('opt-container'),
  getOptWeekContainer = document.getElementById('opt-container2');
  updateScatterApp();
  if (applicationFilterValues.length == 1) {
  	if (initData.hourTime) updateHourlyPageload();
    if (initData.daily) updateDailyPageload();
    getContainer.style.display = 'inline-flex';
    getOptWeekContainer.style.display = 'inline-flex';
  } else {
    getContainer.style.display = 'none';
    getOptWeekContainer.style.display = 'none';
  }
  updateMap();
  updateScatterPage();
}

function initAllFilterOptions() {
  var i, filterDiv, labelOption, appData = initData.maxPageType;
  for(i = 0; i < appData.length; i++) {
    setFilterOptions(appData[i].appname, applicationFilterValues, 'opt-appName-options');
    setFilterOptions(appData[i].portfolio, portfolioFilterValues, 'opt-portfolio-options');
    setFilterOptions(appData[i].md, managingDirectorFilterValues, 'opt-manDirector-options');
    setFilterOptions(appData[i].lead, leadFilterValues, 'opt-lead-options');
    setFilterOptions(appData[i].manager, managerFilterValues, 'opt-manager-options');
    setFilterOptions(appData[i].servicetier, serviceTierFilterValues, 'opt-servTier-options');
  }
  updateTooltipText('opt-appName', applicationFilterValues, ALL);
  updateTooltipText('opt-portfolio', portfolioFilterValues, ALL);
  updateTooltipText('opt-manDirector', managingDirectorFilterValues, ALL);
  updateTooltipText('opt-lead', leadFilterValues, ALL);
  updateTooltipText('opt-manager', managerFilterValues, ALL);
  updateTooltipText('opt-servTier', serviceTierFilterValues, ALL);
}

function isValidFilterData(data) {
  var isValid = false;
  if (((applicationFilterValues.indexOf(data.appname) > -1 && 
      selectedApp == '') || selectedApp == data.appname) && 
      portfolioFilterValues.indexOf(data.portfolio) > -1 && 
      managingDirectorFilterValues.indexOf(data.md) > -1 && 
      leadFilterValues.indexOf(data.lead) > -1 && 
      managerFilterValues.indexOf(data.manager) > -1 && 
      serviceTierFilterValues.indexOf(data.servicetier) > -1) {
    isValid = true;
  }
  return isValid;
}

function getAggregationValue(data) {
  return aggregationFilterValue == '90th Percentile' ? parseFloat(data.percentile90th) : 
         aggregationFilterValue == 'Maximum' ? parseFloat(data.max) : 
         aggregationFilterValue == 'Minimum' ? parseFloat(data.min) : 
         aggregationFilterValue == 'Average' ? parseFloat(data.avg) : 0;
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

function updateApplicationFilterOptionsSingleSelect() {
  var i, labels = document.getElementById('opt-appName-options').childNodes;
  for (i = 0; i < labels.length; i++) {
  	labels[i].firstElementChild.checked = labels[i].firstElementChild.value == applicationFilterValues[0];
  }
  updateTooltipText('opt-appName', applicationFilterValues);
}

function bodyOnClickEvent(checkBoxDivId) {
  if(isBodyClicked && expanded) showCheckboxes(checkBoxDivId, false);
}

function updateAllFilterOptions(hasPortfolioFilterChanged, hasMdFilterChanged, hasLeadFilterChanged, hasManagerFilterChanged, hasServTierFilterChanged) {
  var appData = initData.maxPageType;
  if (hasPortfolioFilterChanged) clearArray(managingDirectorFilterValues);
  if (hasMdFilterChanged) clearArray(leadFilterValues);
  if (hasLeadFilterChanged) clearArray(managerFilterValues);
  if (hasManagerFilterChanged) clearArray(serviceTierFilterValues);
  if (hasServTierFilterChanged) clearArray(applicationFilterValues);
  for (var i = 0; i < appData.length; i++) {
    if (portfolioFilterValues.indexOf(appData[i].portfolio) > -1 &&
        (hasPortfolioFilterChanged || managingDirectorFilterValues.indexOf(appData[i].md) > -1) &&
        (hasMdFilterChanged || leadFilterValues.indexOf(appData[i].lead) > -1) &&
        (hasLeadFilterChanged || managerFilterValues.indexOf(appData[i].manager) > -1) &&
        (hasManagerFilterChanged || serviceTierFilterValues.indexOf(appData[i].servicetier) > -1)) {
      if (hasPortfolioFilterChanged) setFilterValues(appData[i].md, managingDirectorFilterValues);
      if (hasMdFilterChanged) setFilterValues(appData[i].lead, leadFilterValues);
      if (hasLeadFilterChanged) setFilterValues(appData[i].manager, managerFilterValues);
      if (hasManagerFilterChanged) setFilterValues(appData[i].servicetier, serviceTierFilterValues);
      if (hasServTierFilterChanged) setFilterValues(appData[i].appname, applicationFilterValues);
    }
  }
  if (hasPortfolioFilterChanged) updateFilterOptions(managingDirectorFilterValues, 'opt-manDirector-options', 'opt-manDirector');
  if (hasMdFilterChanged) updateFilterOptions(leadFilterValues, 'opt-lead-options', 'opt-lead');
  if (hasLeadFilterChanged) updateFilterOptions(managerFilterValues, 'opt-manager-options', 'opt-manager');
  if (hasManagerFilterChanged) updateFilterOptions(serviceTierFilterValues, 'opt-servTier-options', 'opt-servTier');
  if (hasServTierFilterChanged) updateFilterOptions(applicationFilterValues, 'opt-appName-options', 'opt-appName');
}

function setFilterValues(dataValue, filterValues) {
  if(filterValues.indexOf(dataValue) < 0) filterValues.push(dataValue);
}

function updateFilterOptions(filterValues, checkBoxDivId, selectBoxId) {
  var i, labels = document.getElementById(checkBoxDivId).childNodes;
  labels[0].firstElementChild.checked = true;
  for (i = 1; i < labels.length; i++) {
  	if (filterValues.indexOf(labels[i].firstElementChild.value) > -1) {
  	  labels[i].style.display = 'block';
  	  labels[i].firstElementChild.checked = true;
  	} else {
  	  labels[i].style.display = 'none';
  	  labels[i].firstElementChild.checked = false;
  	}
  }
  updateTooltipText(selectBoxId, filterValues, ALL);
}

function setFilterOptions(dataValue, filterValues, optionsCheckBoxDiv) {
  var filterDiv, labelOption;
  if(filterValues.indexOf(dataValue) < 0) {
    filterDiv = document.getElementById(optionsCheckBoxDiv);
    labelOption = document.createElement('label');
    labelOption.style.display = 'block';
    labelOption.innerHTML = '<input type="checkbox" value="' + dataValue + '" checked/>' + dataValue;
    filterDiv.appendChild(labelOption);
    filterValues.push(dataValue);
  }
}

function updateTooltipText(selectBoxId, filterValues, allVal) {
  var i, filterText = '', len = filterValues.length;
  for (i = 0; i < len; i++) {
  	filterText += filterValues[i];
  	if (i < len - 1) filterText += ', <br>';
  }
  document.getElementById(selectBoxId).innerHTML = '<option>' + (allVal ? allVal : filterText) + '</option>';
  document.getElementById(selectBoxId).nextSibling.innerHTML = filterText;
  document.getElementById(selectBoxId).nextSibling.style.display = allVal ? "none" : "block";
}

function optionsOnClickEvent(selectBoxId, childNodes, filterValues) {
  selectedApp = '';
  isBodyClicked = false;
  if (!isAllOptionClicked) {
  	clearArray(filterValues);
	var isAllChecked = true;
  	for (var i = 1; i < childNodes.length; i++) {
  	  if (childNodes[i].style.display == 'block') {
        if(childNodes[i].firstElementChild.checked) {
          filterValues.push(childNodes[i].firstElementChild.value);
        } else {
      	  isAllChecked = false;
        }
  	  }	
    }
    if (isAllChecked) {
  	  childNodes[0].firstElementChild.checked = true;
  	  updateTooltipText(selectBoxId, filterValues, ALL);
    } else {
	  childNodes[0].firstElementChild.checked = false;
	  updateTooltipText(selectBoxId, filterValues);
    }
  }
  isAllOptionClicked = false;
}

function optionAllOnClickEvent(selectBoxId, childNodes, filterValues) {
  var i;
  isBodyClicked = false;
  isAllOptionClicked = true;
  if (childNodes[0].firstChild.checked) {
  	for (i = 1; i < childNodes.length; i++) {
  	  if (childNodes[i].style.display == 'block') {
  	    filterValues.push(childNodes[i].firstElementChild.value);
        childNodes[i].firstElementChild.checked = true;
      }
    }
    updateTooltipText(selectBoxId, filterValues, ALL);
  } else {
    for (i = 1; i < childNodes.length; i++) {
      childNodes[i].firstElementChild.checked = false;
    }
    clearArray(filterValues);
    updateTooltipText(selectBoxId, filterValues);
  }
}

function selectBoxOnClickEvent(checkBoxDivId) {
  isBodyClicked = false;
  if (expanded && latestExpandedFilter == checkBoxDivId) {
    showCheckboxes(checkBoxDivId, false);
  } else if (expanded && latestExpandedFilter != checkBoxDivId) {
    showCheckboxes(latestExpandedFilter, false);
    showCheckboxes(checkBoxDivId, true);
  } else {
    showCheckboxes(checkBoxDivId, true);
  }
}

function showCheckboxes(checkBoxDivId, isShown) {
  var checkBoxDiv = document.getElementById(checkBoxDivId);
  if (isShown) {
  	checkBoxDiv.style.display = "block";
  	expanded = true;
  } else {
  	checkBoxDiv.style.display = "none";
  	expanded = false;
  }
}

function clearArray(arr) {
  for (var i = arr.length; i > 0; i--) {
    arr.pop();
  }
}

function getText(obj) {
  return obj.textContent ? obj.textContent : obj.innerText;
}

getData();