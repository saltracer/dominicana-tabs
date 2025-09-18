#!/usr/bin/perl

use CGI::Carp qw(fatalsToBrowser);
use Time::Local;

$wdayName[0] = "Sunday";
$wdayName[1] = "Monday";
$wdayName[2] = "Tuesday";
$wdayName[3] = "Wednesday";
$wdayName[4] = "Thursday";
$wdayName[5] = "Friday";
$wdayName[6] = "Saturday";

$monthName[0]  = "January";
$monthName[1]  = "February";
$monthName[2]  = "March";
$monthName[3]  = "April";
$monthName[4]  = "May";
$monthName[5]  = "June";
$monthName[6]  = "July";
$monthName[7]  = "August";
$monthName[8]  = "September";
$monthName[9]  = "October";
$monthName[10] = "November";
$monthName[11] = "December";

$weekName[0] = "0th";
$weekName[1] = "1st";
$weekName[2] = "2nd";
$weekName[3] = "3rd";
$weekName[4] = "4th";
$weekName[5] = "5th";
$weekName[6] = "6th";
$weekName[7] = "7th";
$weekName[8] = "8th";
$weekName[9] = "9th";
$weekName[10] = "10th";
$weekName[11] = "11th";
$weekName[12] = "12th";
$weekName[13] = "13th";
$weekName[14] = "14th";
$weekName[15] = "15th";
$weekName[16] = "16th";
$weekName[17] = "17th";
$weekName[18] = "18th";
$weekName[19] = "19th";
$weekName[20] = "20th";
$weekName[21] = "21st";
$weekName[22] = "22nd";
$weekName[23] = "23rd";
$weekName[24] = "24th";
$weekName[25] = "25th";
$weekName[26] = "26th";
$weekName[27] = "27th";
$weekName[28] = "28th";
$weekName[29] = "29th";
$weekName[30] = "30th";
$weekName[31] = "31st";
$weekName[32] = "32nd";
$weekName[33] = "33rd";
$weekName[34] = "34th";

$graphicDir = "../pics";

$nographic = "<h1> Ken Crawford's blog:<br />
As we forgive those who trespass against us</h1>";

$backColorTemplate{'Violet'} = "#AF005F";
$listColorTemplate{'Violet'} = "#FFCFCF";
$headColorTemplate{'Violet'} = "#5F001F";
$nameColorTemplate{'Violet'} = "#5F001F";
$textColorTemplate{'Violet'} = "#FFCFCF";
$linkColorTemplate{'Violet'} = "#7F7FCF";
$headGraphTemplate{'Violet'} = "<img src=\"$graphicDir/blogheader_violet.jpg\" alt=\"Violet header graphic\" />";
$backColorTemplate{'Purple'} = "#7F00AF";
$listColorTemplate{'Purple'} = "#FFCFCF";
$headColorTemplate{'Purple'} = "#3F005F";
$nameColorTemplate{'Purple'} = "#3F005F";
$textColorTemplate{'Purple'} = "#000000";
$linkColorTemplate{'Purple'} = "#CFCFFF";
$headGraphTemplate{'Purple'} = "<img src=\"$graphicDir/blogheader_purple.jpg\" alt=\"Purple header graphic\" />";
$backColorTemplate{'Rose'}   = "#FF7FAF";
$listColorTemplate{'Rose'}   = "#FFCFCF";
$headColorTemplate{'Rose'}   = "#CF7F7F";
$nameColorTemplate{'Rose'}   = "#CF7F7F";
$textColorTemplate{'Rose'}   = "#000000";
$linkColorTemplate{'Rose'}   = "#0000CF";
$headGraphTemplate{'Rose'}   = "<img src=\"$graphicDir/blogheader_rose.jpg\" alt=\"Rose header graphic\" />";
$backColorTemplate{'Gold'}   = "#FFCF00";
$listColorTemplate{'Gold'}   = "#FFFFC7";
$headColorTemplate{'Gold'}   = "#3F3F00";
$nameColorTemplate{'Gold'}   = "#3F3F00";
$textColorTemplate{'Gold'}   = "#000000";
$linkColorTemplate{'Gold'}   = "#0000CF";
$headGraphTemplate{'Gold'}   = "<img src=\"$graphicDir/blogheader_gold.jpg\" alt=\"Gold header graphic\" />";
$backColorTemplate{'White'}  = "#FFFFC7";
$listColorTemplate{'White'}  = "#FFFFFF";
$headColorTemplate{'White'}  = "#3F3F00";
$nameColorTemplate{'White'}  = "#FFFFFF";
$textColorTemplate{'White'}  = "#000000";
$linkColorTemplate{'White'}  = "#0000CF";
$headGraphTemplate{'White'}  = "<img src=\"$graphicDir/blogheader_white.jpg\" alt=\"White header graphic\" />";
$backColorTemplate{'Red'}    = "#FF0000";
$listColorTemplate{'Red'}    = "#FFCFCF";
$headColorTemplate{'Red'}    = "#5F0000";
$nameColorTemplate{'Red'}    = "#FF0000";
$textColorTemplate{'Red'}    = "#000000";
$linkColorTemplate{'Red'}    = "#0000FF";
$headGraphTemplate{'Red'}    = "<img src=\"$graphicDir/blogheader_red.jpg\" alt=\"Red header graphic\" />";
$backColorTemplate{'Green'}  = "#009F00";
$listColorTemplate{'Green'}  = "#AFFFAF";
$headColorTemplate{'Green'}  = "#005F00";
$nameColorTemplate{'Green'}  = "#005F00";
$textColorTemplate{'Green'}  = "#AFFFAF";
$linkColorTemplate{'Green'}  = "#0000FF";
$headGraphTemplate{'Green'}  = "<img src=\"$graphicDir/blogheader_green.jpg\" alt=\"Green header graphic\" />";
$backColorTemplate{'Black'}  = "#3F3F3F";
$listColorTemplate{'Black'}  = "#5F5F5F";
$headColorTemplate{'Black'}  = "#000000";
$nameColorTemplate{'Black'}  = "#000000";
$textColorTemplate{'Black'}  = "#FFFFFF";
$linkColorTemplate{'Black'}  = "#3F3FAF";
$headGraphTemplate{'Black'}  = "<img src=\"$graphicDir/blogheader_black.jpg\" alt=\"Black header graphic\" />";

$color{'Advent'} = "Purple";
$color{'Gaudette Sunday (3rd Sunday of Advent)'} = "Rose";
$color{'Christmas Day (Holy Day of Obligation)'} = "Gold";
$color{'Christmas'} = "White";
$color{'Epiphany'} = "White";
$color{'Epiphany (Celebrated)'} = "White";
$color{'The Baptism of the Lord'} = "White";
$color{'The Baptism of the Lord (Celebrated)'} = "White";
$color{'The Conversion of Paul'} = "Red";
$color{'The Presentation of Our Lord in the Temple'} = "White";
$color{'Ash Wednesday'} = "Violet";
$color{'Lent'} = "Violet";
$color{'The Annunciation'} = "White";
$color{'Laetare Sunday (4th Sunday of Lent)'} = "Rose";
$color{'Palm Sunday (6th Sunday of Lent)'} = "Red";
$color{'Holy Week'} = "Violet";
$color{'Holy Thursday'} = "Red";
$color{'Good Friday'} = "Black";
$color{'Holy Saturday'} = "Red";
$color{'Easter Sunday'} = "Gold";
$color{'Octave of Easter'} = "White";
$color{'Divine Mercy Sunday'} = "White";
$color{'Easter'} = "White";
$color{'The Visitation of Mary to Elizabeth'} = "White";
$color{'The Birth of John the Baptist'} = "White";
$color{'The Ascension'} = "White";
$color{'The Ascension (Celebrated)'} = "White";
$color{'Pentacost'} = "Red";
$color{'Ordinary Time'} = "Green";
$color{'The Transfiguration'} = "White";
$color{'The Beheading of John the Baptist, Martyr'} = "Red";
$color{'The Birth of Mary'} = "White";
$color{'Feast'} = "White";
$color{'Martyr Feast'} = "Red";
$color{'Solemnity'} = "White";
$color{'Martyr Solemnity'} = "Red";
$color{'Memorial'} = "White";

if (open(FORCEFILE, "forceSeason.dat"))
	{
	$forceColor = <FORCEFILE>;
	
	foreach (keys(%color))
		{
		$color{$_} = $forceColor;
		}
	close(FORCEFILE);
	}

#Populates color palatte
while (($key, $value) = each %color)
	{
	$backColor{$key} = $backColorTemplate{$value};
	$listColor{$key} = $listColorTemplate{$value};
	$headColor{$key} = $headColorTemplate{$value};
	$nameColor{$key} = $nameColorTemplate{$value};
	$linkColor{$key} = $linkColorTemplate{$value};
	$textColor{$key} = $textColorTemplate{$value};
	$headGraph{$key} = $headGraphTemplate{$value};
	}
	
sub getInfo
	{
	my($info, $inDay, $inMon, $inYear) = @_;
	
	if ((defined($inDay)) && (defined($inMon)) && (defined($inYear)))
		{
		$curTime = timelocal(0, 0, 0, $inDay, $inMon, $inYear);
		}
	else
		{
		$curTime = time();
		}


	($sec,$min,$hour,$day,$mon,$year,$wday,$yday,$isdst) = localtime($curTime);
	$year = $year+1900;
	$yearOffset = ($yday-$wday)%7;
	$weekCount = int(($yday-$yearOffset)/7);

	if ($yearOffset < 1)
		{
		$weekCount--;
		}

	#Calculate Easter's day of the year
	#Got this from a website so excuse the variable names
	$B = 225 - 11*($year%19);
	$D = (($B-21)%30) + 21;
	if ($D > 48)
		{
		$D--;
		} 
	$E = ($year + int($year/4) + $D + 1)%7;
	$Q= $D + 7 - $E;

	$easterYday = $Q + 58;
	$christmasYday = 358;
	if ((($year % 4) == 0) && ((($year % 100) != 0) || (($year % 400) == 0)))
		{
		$easterYday++;
		$christmasYday++;
		}

	$ashWedYday = $easterYday - 46;
	$holyWeekYday = $easterYday - 6;
	$octaveYday = $easterYday + 8;
	$pentYday = $easterYday + 49;

	$christmasWday = ($christmasYday-$yearOffset)%7;
	if ($christmasWday == 0)
		{
		$newLitYearYday = $christmasYday - 28;
		}
	else
		{
		$newLitYearYday = $christmasYday - 21 - $christmasWday;
		}

	if ($yday < 6)
		{
		$litTime = "Christmas";
		}
	elsif ($yday < $ashWedYday)
		{
		$litTime = "Ordinary Time";
		}
	elsif ($yday < $holyWeekYday)
		{
		$litTime = "Lent";
		$weekCount = int(($yday-$ashWedYday-4)/7)+1;
		}
	elsif ($yday < $easterYday)
		{
		$litTime = "Holy Week";
		}
	elsif ($yday < $octaveYday)
		{
		$litTime = "Octave of Easter";
		}
	elsif ($yday < $pentYday)
		{
		$litTime = "Easter";
		$weekCount = int(($yday-$easterYday)/7)+1;
		}
	elsif ($yday < $newLitYearYday)
		{
		$litTime = "Ordinary Time";
		$weekCount = $weekCount - 12;
		}
	elsif ($yday < $christmasYday)
		{
		$litTime = "Advent";
		$weekCount = int(($yday-$newLitYearYday)/7)+1;
		}
	else
		{
		$litTime = "Christmas";
		}

	#Feast Days (not based on Easter or New Liturgical Year)
	if ($wday != 0)
		{
		# if (($mon ==  0) && ($day == 28)) {$litTime = "Memorial";        $text="Saint Thomas Aquinas, Doctor";}
		# if (($mon ==  1) && ($day == 11)) {$litTime = "Memorial";        $text="Our Lady of Lourdes";}
		# if (($mon ==  1) && ($day == 22)) {$litTime = "Martyr Feast";    $text="The Chair of Saint Peter, Apostle and Martyr";}
		# if (($mon ==  2) && ($day == 17)) {$litTime = "Memorial";        $text="Saint Patrick";}
		# if (($mon ==  3) && ($day ==  4)) {$litTime = "Memorial";        $text="Saint Isidore";}
		# if (($mon ==  3) && ($day == 25)) {$litTime = "Feast";           $text="Saint Mark, Evangelist";}
		# if (($mon ==  4) && ($day ==  3)) {$litTime = "Feast";           $text="Saints Phillip and James, Apostles";}
		# if (($mon ==  4) && ($day == 14)) {$litTime = "Feast";           $text="Saint Matthias, Apostle";}
		# if (($mon ==  5) && ($day == 11)) {$litTime = "Memorial";        $text="Saint Barnabas, Apostle";}
		# if (($mon ==  6) && ($day ==  3)) {$litTime = "Feast";           $text="Saint Thomas, Apostle";}
		# if (($mon ==  6) && ($day == 11)) {$litTime = "Memorial";        $text="Saint Benedict";}
		# if (($mon ==  6) && ($day == 22)) {$litTime = "Memorial";        $text="Saint Mary Magdalene";}
		# if (($mon ==  6) && ($day == 25)) {$litTime = "Martyr Feast";    $text="Saint James, Apostle and Martyr";}
		# if (($mon ==  6) && ($day == 29)) {$litTime = "Memorial";        $text="Saint Martha";}
		# if (($mon ==  6) && ($day == 31)) {$litTime = "Memorial";        $text="Saint Ignatius of Loyola, Founder of the Jesuits";}
		# if (($mon ==  7) && ($day == 10)) {$litTime = "Martyr Feast";    $text="Saint Lawrence, Deacon and Martyr";}
		# if (($mon ==  7) && ($day == 24)) {$litTime = "Feast";           $text="Saint Bartholomew, Apostle";}
		# if (($mon ==  7) && ($day == 28)) {$litTime = "Memorial";        $text="Saint Augustine, Bishop and Doctor";}
		# if (($mon ==  8) && ($day ==  3)) {$litTime = "Memorial";        $text="Saint Gregory the Great, Pope and Doctor";}
		# if (($mon ==  8) && ($day == 14)) {$litTime = "Feast";           $text="The Triumph of the Cross";}
		# if (($mon ==  8) && ($day == 21)) {$litTime = "Feast";           $text="Saint Matthew, Apostle and Evangelist";}
		# if (($mon ==  8) && ($day == 29)) {$litTime = "Feast";           $text="Michael, Gabriel and Raphael, Archangels";}
		# if (($mon ==  8) && ($day == 30)) {$litTime = "Memorial";        $text="Saint Jerome";}
		# if (($mon ==  9) && ($day ==  4)) {$litTime = "Memorial";        $text="Saint Francis of Assisi";}
		# if (($mon ==  9) && ($day == 18)) {$litTime = "Feast";           $text="Saint Luke, Evangelist";}
		# if (($mon ==  9) && ($day == 28)) {$litTime = "Feast";           $text="Saints Simon and Jude, Apostles";}
		# if (($mon == 10) && ($day ==  2)) {$litTime = "Feast";           $text="All Souls Day";}
		# if (($mon == 10) && ($day ==  9)) {$litTime = "Feast";           $text="The Dedication of Saint John's Lateran";}
		# if (($mon == 10) && ($day == 30)) {$litTime = "Feast";           $text="Saint Andrew, Apostle";}
		# if (($mon == 11) && ($day == 12)) {$litTime = "Memorial";        $text="Our Lady of Guadalupe";}
		# if (($mon == 11) && ($day == 26)) {$litTime = "Martyr Feast";    $text="Saint Stephen, First Martyr";}
		# if (($mon == 11) && ($day == 27)) {$litTime = "Feast";           $text="Saint John, Apostle and Evangelist";}
		# if (($mon == 11) && ($day == 28)) {$litTime = "Martyr Feast";    $text="The Holy Innocents, Martyrs";}
		}

	#Liturgical Celebration Days based on New Year
	if (($wday == 0) && ($weekCount == 0) && ($yday <=  8)) {$litTime = "Epiphany (Celebrated)";}
	if (($wday == 0) && ($weekCount == 1) && ($yday <= 15)) {$litTime = "The Baptism of the Lord (Celebrated)";}

	#Solemnities and other calendar based Liturgical days
	if (($mon ==  0) && ($day ==  1)) {$litTime = "Solemnity";       $text="Mary the Mother of God (Holy Day of Obligation)";}
	if (($mon ==  0) && ($day ==  6)) {$litTime = "Epiphany";}
	if (($mon ==  0) && ($day == 12)) {$litTime = "The Baptism of the Lord";}
	if (($mon ==  0) && ($day == 25)) {$litTime = "The Conversion of Paul";}
	if (($mon ==  1) && ($day ==  2)) {$litTime = "The Presentation of Our Lord in the Temple";}
	if (($mon ==  2) && ($day == 19)) {$litTime = "Solemnity";       $text="Saint Joseph, Husband of Mary";}
	if (($mon ==  2) && ($day == 25)) {$litTime = "The Annunciation";}
	if (($mon ==  4) && ($day == 31)) {$litTime = "The Visitation of Mary to Elizabeth";}
	if (($mon ==  5) && ($day == 24)) {$litTime = "The Birth of John the Baptist";}
	if (($mon ==  5) && ($day == 29)) {$litTime = "Martyr Solemnity";$text="Saints Peter and Paul, Apostles and Martyrs";}
	if (($mon ==  7) && ($day ==  6)) {$litTime = "The Transfiguration";}
	if (($mon ==  7) && ($day == 15)) {$litTime = "Solemnity";       $text="The Assumption of Blessed Virgin (Holy Day of Obligation)";}
	if (($mon ==  7) && ($day == 29)) {$litTime = "The Beheading of John the Baptist, Martyr";}
	if (($mon ==  8) && ($day ==  8)) {$litTime = "The Birth of Mary";}
	if (($mon == 10) && ($day ==  1)) {$litTime = "Solemnity";       $text="All Saints Day (Holy Day of Obligation)";}
	if (($mon == 11) && ($day ==  8)) {$litTime = "Solemnity";       $text="The Immaculate Conception of Mary (Holy Day of Obligation)";}
	if (($mon == 11) && ($day == 25)) {$litTime = "Christmas Day (Holy Day of Obligation)";}

	#Liturgical Days based on Easter
	if ($yday == ($easterYday-46)) {$litTime = "Ash Wednesday";}
	if ($yday == ($easterYday-21)) {$litTime = "Laetare Sunday (4th Sunday of Lent)";}
	if ($yday == ($easterYday- 7)) {$litTime = "Palm Sunday (6th Sunday of Lent)";}
	if ($yday == ($easterYday- 3)) {$litTime = "Holy Thursday";}
	if ($yday == ($easterYday- 2)) {$litTime = "Good Friday";}
	if ($yday == ($easterYday- 1)) {$litTime = "Holy Saturday";}
	if ($yday == ($easterYday))    {$litTime = "Easter Sunday";}
	if ($yday == ($easterYday+7))  {$litTime = "Divine Mercy Sunday";}
	if ($yday == ($easterYday+39)) {$litTime = "The Ascension";}
	if ($yday == ($easterYday+42)) {$litTime = "The Ascension (Celebrated)";}
	if ($yday == ($easterYday+49)) {$litTime = "Pentacost";}
	if ($yday == ($easterYday+56)) {$litTime = "Solemnity"; $text="the Holy Trinity";}
	if ($yday == ($easterYday+63)) {$litTime = "Solemnity"; $text="Corpus Christi";}
	if ($yday == ($easterYday+70)) {$litTime = "Solemnity"; $text="the Sacred Heart of Jesus";}

	#Liturgical Days based on New Liturgical Year
	if ($yday == ($newLitYearYday- 7)) {$litTime = "Solemnity"; $text="Christ the King";}
	if ($yday == ($newLitYearYday+14)) {$litTime = "Gaudette Sunday (3rd Sunday of Advent)";}
	if ((($yday == ($newLitYearYday+35)) && ($newLitYearYday+28 == $christmasYday)) ||
		 (($yday == ($newLitYearYday+28)) && ($newLitYearYday+28 != $christmasYday))) {$litTime = "Solemnity"; $text="the Holy Family";}

	if (($info ne "day") && ($info ne "dayLen"))
		{
		return("$$info{$litTime}");
		}
	else
		{
		if (($litTime ne "Advent") && ($litTime ne "Ordinary Time") && ($litTime ne "Lent") &&
				($litTime ne "Easter") && ($litTime ne "Christmas") && ($litTime ne "Feast") &&
				($litTime ne "Martyr Feast") && ($litTime ne "Solemnity") && ($litTime ne "Martyr Solemnity") &&
				($litTime ne "Memorial") && ($litTime ne "Holy Week") && ($litTime ne "Octave of Easter")) 
			{
			$day = $litTime;
			}
		elsif (($litTime eq "Feast") || ($litTime eq "Martyr Feast"))
			{
			$day = "The Feast of $text";
			}
		elsif (($litTime eq "Solemnity") || ($litTime eq "Martyr Solemnity"))
			{
			$day = "The Solemnity of $text";
			}
		elsif ($litTime eq "Memorial")
			{
			$day = "The Memorial of $text";
			}
		elsif ($litTime eq "Christmas")
			{
			if ($yday >= $christmasYday)
				{
				$day = "The $weekName[$yday-$christmasYday+1] day of Christmas";
				}
			else
				{
				$day = "The $weekName[$yday+8] day of Christmas";
				}
			}
		elsif (($yday < ($ashWedYday+4)) && ($litTime eq "Lent"))
			{
			$day = "The $wdayName[$wday] after Ash Wednesday (Lent)";
			}
		elsif (($weekCount == 0) && ($litTime eq "Ordinary Time"))
			{
			$day = "The $wdayName[$wday] after Epiphany (Ordinary Time)";
			}
		elsif ($litTime eq "Holy Week")
			{
			$day = "$wdayName[$wday] of $litTime";
			}
		elsif ($litTime eq "Octave of Easter")
			{
			$day = "$wdayName[$wday] of the $litTime";
			}
		elsif ($litTime eq "Ordinary Time")
			{
			$day = "The $weekName[$weekCount] $wdayName[$wday] in $litTime";
			}
		else
			{
			$day = "The $weekName[$weekCount] $wdayName[$wday] of $litTime";
			}

		if ($info eq "day")
			{
			return($day);
			}
		elsif ($info eq dayLen)
			{
			$dayLen = length($day) + 21;
			$litLen = length($color) + 46;
			if ($litLen > $dayLen)
				{
				return($litLen);
				}
			else
				{
				return($dayLen);
				}
			}
		}
	}

print "Content-type: text/html\n\n";

$queryString = $ENV{'QUERY_STRING'};
@queryPairs = split(/&/, $queryString);

foreach $queryPair (@queryPairs)
	{
	($name, $value) = split(/=/, $queryPair);
	$value =~ tr/\+/ /;
	$value =~ s/%([\dA=Fa-f][\dA-Fa-f])/ pack ("C", hex ($1))/eg;
	$name =~ tr/\+/ /;
	$name =~ s/%([\dA=Fa-f][\dA-Fa-f])/ pack ("C", hex ($1))/eg;
	$$name = $value;
	#print "$name = $value<br>\n";
	}

if (($ARGV[0] ne "") && ($ARGV[0] ne "."))
	{
	$loop = $ARGV[0];
	}
if (($ARGV[1] ne "") && ($ARGV[1] ne "."))
	{
	$info = $ARGV[1];
	}
if (($ARGV[2] ne "") && ($ARGV[2] ne "."))
	{
	$inWday = $ARGV[2];
	}
if (($ARGV[3] ne "") && ($ARGV[3] ne "."))
	{
	$inYear = $ARGV[3];
	}
if (($ARGV[4] ne "") && ($ARGV[4] ne "."))
	{
	$inMon = $ARGV[4];
	}
if (($ARGV[5] ne "") && ($ARGV[5] ne "."))
	{
	$inDay = $ARGV[5];
	}

if ($loop eq "")
	{
	#individual bit of info mode
	print getInfo($info, $inDay, $inMon, $inYear);
	}
elsif ($loop eq "calendar")
	{
	#month calendar output mode
	if (($inMon eq "") || ($inYear eq ""))
		{
		$curTime = time();
		($tmp,$tmp,$tmp,$tmp,$inMon,$inYear,$tmp,$tmp,$tmp) = localtime($curTime);
		}
	else
		{
		$inYear = $inYear - 1900;
		}

	if ($inMon == 1)
		{
		if ((($inYear % 4) == 0) && ((($inYear % 100) != 0)) || (($inYear % 400) == 0))
			{
			$greatestDay = 29;
			}
		else
			{
			$greatestDay = 28;
			}
		}
	elsif (($inMon == 8) || ($inMon == 3) || ($inMon == 5) || ($inMon == 10))
		{
		$greatestDay = 30;
		}
	else
		{
		$greatestDay = 31;
		}
	
	$monBegin = timelocal(0, 0, 0, 1, $inMon, $inYear);
	($tmp,$tmp,$tmp,$tmp,$tmp,$tmp,$monBeginWDay,$tmp,$tmp) = localtime($monBegin);

	$inYear = $inYear + 1900;
	if ($inMon == 0)
		{
		$prevMon = 11;
		$prevYear = $inYear -1;
		$nextMon = $inMon + 1;
		$nextYear = $inYear;
		}
	elsif ($inMon == 11)
		{
		$prevMon = $inMon - 1;
		$prevYear = $inYear;
		$nextMon = 0;
		$nextYear = $inYear + 1;
		}
	else
		{
		$prevMon = $inMon - 1;
		$prevYear = $inYear;
		$nextMon = $inMon + 1;
		$nextYear = $inYear;
		}
	
	$color = getInfo("color");

	print "<html>\n";
	print "<head>\n";
	print "<title>Catholic Liturgical Calendar</title>\n";
	print "<link Rel=\"stylesheet\" href=\"../calendar_style.css\" type=\"text/css\">\n";
	print "</head>\n";

	print "<body class=${color}Page>\n";
	
	print "<h1>Catholic Liturgical Calendar</hl>\n";
	
	print "<table>\n";
	print "<form action=\"litInfo.cgi\" METHOD=\"GET\">\n";
	print "<input type=\"hidden\" name=\"loop\" value=\"calendar\">\n";
	print "<tr>\n";
	print "	<td class=TDCenter colspan=3>Jump to month:\n";
	print "	<select name=\"inMon\">\n";
	for ($i=0; $i<=$#monthName; $i++)
		{
		print "		<option value=\"$i\">$monthName[$i]\n";
		}
	print "	</select>\n";
	print "	<select name=\"inYear\">\n";
	$nowTime = time();
	($tmp,$tmp,$tmp,$tmp,$tmp,$nowYear,$tmp,$tmp,$tmp) = localtime($nowTime);
	$nowYear = $nowYear + 1900;
	for ($i=$nowYear; $i<$nowYear+50; $i++)
		{
		print "		<option>$i\n";
		}
	print "	</select>\n";
	print "	<input type=\"submit\" value=\"go\"></td>\n";
	print "</tr>\n";
	print "</form>\n";
	
	print "<tr>\n";
	print "	<td width=\"33%\"><a class=${color}Page href=\"$link?inMon=$prevMon&inYear=$prevYear&loop=calendar\"><-$monthName[$prevMon] $prevYear</a></td>\n";
	print "	<td class=TDCenterTitle>$monthName[$inMon] $inYear:</td>\n";
	print "	<td class=TDRight width=\"33%\"><a class=${color}Page href=\"$link?inMon=$nextMon&inYear=$nextYear&loop=calendar\">$monthName[$nextMon] $nextYear-></a></td>\n";
	print "</tr>\n";
	print "</table>\n";
	
	print "<table class=\"calendar\">\n";
	print "<tr>";
	print "<td class=TDHeader width=14%>Sunday:</td>";
	print "<td class=TDHeader width=14%>Monday:</td>";
	print "<td class=TDHeader width=14%>Tuesday:</td>";
	print "<td class=TDHeader width=14%>Wednesday:</td>";
	print "<td class=TDHeader width=14%>Thursday:</td>";
	print "<td class=TDHeader width=14%>Friday:</td>";
	print "<td class=TDHeader width=14%>Saturday:</td>";
	print "</tr>\n";

	print "<tr height=100>";
	for ($i=0; $i<$monBeginWDay; $i++)
		{
		print "<td></td>";
		}

	for ($i=1; $i<=$greatestDay; $i++)
		{
		$color = getInfo("color", $i, $inMon, $inYear);
		$text = getInfo("day", $i, $inMon, $inYear);
		print "<td class=$color>";
		print "	$i:<br>";
		print "	$text";
		print "</td>";
		
		if ((($i+$monBeginWDay)%7) == 0)
			{
			print "</tr>\n";
			print "<tr height=100>";
			}
		}
	print "</tr>\n";
	print "</table>\n";
	
	print "</body>\n";
	print "</html>\n";	
	}
else
	{
	#List output mode
	$curTime = timelocal(0, 0, 0, 1, 0, $inYear);
	$endTime = $curTime + 31536000;
	
	#$info = ",$info,";
	
	print "<table border=1>\n";
	print "	<tr>\n";
	print "		<td>\n";
	print "date:\n";
	print "		</td>\n";
	if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /Day/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!day,/)))
		{
		print "		<td>\n";
		print "day:\n";
		print "		</td>\n";
		}
	if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /dayLen/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!dayLen,/)))
		{
		print "		<td>\n";
		print "dayLen:\n";
		print "		</td>\n";
		}
	if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /color/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!color,/)))
		{
		print "		<td>\n";
		print "color:\n";
		print "		</td>\n";
		}
	if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /backColor/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!backColor,/)))
		{
		print "		<td>\n";
		print "backColor:\n";
		print "		</td>\n";
		}
	if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /listColor/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!listColor,/)))
		{
		print "		<td>\n";
		print "listColor:\n";
		print "		</td>\n";
		}
	if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /nameColor/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!nameColor,/)))
		{
		print "		<td>\n";
		print "nameColor:\n";
		print "		</td>\n";
		}
	if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /linkColor/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!linkColor,/)))
		{
		print "		<td>\n";
		print "linkColor:\n";
		print "		</td>\n";
		}
	if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /textColor/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!textColor,/)))
		{
		print "		<td>\n";
		print "textColor:\n";
		print "		</td>\n";
		}
	if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /headGraph/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!headGraph,/)))
		{
		print "		<td>\n";
		print "headGraph:\n";
		print "		</td>\n";
		}
	print "	</tr>\n";
	
	for($i=$curTime; $i<=$endTime; $i=$i+86400)
		{
		($sec,$min,$hour,$inDay,$inMon,$inYear,$wday,$yday,$isdst) = localtime($i);
		
		if (($wday != $inWday) && ($inWday ne ""))
			{
			next;
			}
			
		$year = $inYear+1900;
		print "	<tr>\n";
		print "		<td>\n";
		print "$wdayName[$wday] $monthName[$inMon]/$inDay/$year\n";
		print "		</td>\n";
		if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /Day/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!day,/)))
			{
			print "		<td>\n";
			print getInfo("day", $inDay, $inMon, $inYear);
			print "		</td>\n";
			}
		if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /dayLen/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!dayLen,/)))
			{
			print "		<td>\n";
			print getInfo("dayLen", $inDay, $inMon, $inYear);
			print "		</td>\n";
			}
		if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /,color,/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!color,/)))
			{
			print "		<td>\n";
			print getInfo("color", $inDay, $inMon, $inYear);
			print "		</td>\n";
			}
		if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /,backColor,/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!backColor,/)))
			{
			print "		<td>\n";
			print getInfo("backColor", $inDay, $inMon, $inYear);
			print "		</td>\n";
			}
		if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /,listColor,/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!listColor,/)))
			{
			print "		<td>\n";
			print getInfo("listColor", $inDay, $inMon, $inYear);
			print "		</td>\n";
			}
		if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /,nameColor,/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!nameColor,/)))
			{
			print "		<td>\n";
			print getInfo("nameColor", $inDay, $inMon, $inYear);
			print "		</td>\n";
			}
		if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /,linkColor,/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!linkColor,/)))
			{
			print "		<td>\n";
			print getInfo("linkColor", $inDay, $inMon, $inYear);
			print "		</td>\n";
			}
		if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /,textColor,/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!textColor,/)))
			{
			print "		<td>\n";
			print getInfo("textColor", $inDay, $inMon, $inYear);
			print "		</td>\n";
			}
		if (($info eq "all") || ($info eq "") || ($info eq ".") || ($info =~ /,headGraph,/) || ((substr($info,0,2) eq ",!") && !($info =~ /,!headGraph,/)))
			{
			print "		<td>\n";
			print getInfo("headGraph", $inDay, $inMon, $inYear);
			print "		</td>\n";
			}
		print "	</tr>\n";
		}
	print "</table>\n";
	}

