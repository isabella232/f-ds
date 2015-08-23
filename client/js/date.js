var days   = [ 'Sunday'
		         , 'Monday'
		         , 'Tuesday'
		         , 'Wednesday'
		         , 'Thursday'
		         , 'Friday'
		         , 'Saturday']

var months = [ 'January'
		         , 'February'
		         , 'March'
		         , 'April'
		         , 'May'
		         , 'June'
		         , 'July'
		         , 'August'
		         , 'September'
		         , 'October'
		         , 'November'
		         , 'December']

var date = new Date()

var formattedDate = days[date.getDay()] + ',' + '&nbsp;' + months[date.getMonth()] +
  '&nbsp;' + date.getDate() + '&nbsp;&nbsp;' + date.getFullYear()

document.getElementById('date').innerHTML = formattedDate
