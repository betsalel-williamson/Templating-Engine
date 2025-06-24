#
#
# Copyright (c) 1990-2010, Jordan Henderson
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#     * Redistributions of source code must retain the above copyright
#       notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#     * Neither the name of the <organization> nor the
#       names of its contributors may be used to endorse or promote products
#       derived from this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY Jordan Henderson ''AS IS'' AND ANY
# EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL Jordan Henderson BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#
#

proc expandTemplate { varTemp template {lvl 0} } {
    # varTemp - an associative array of key-value pairs.
    #   <#name#> where 'name' is the key and its value.
    #   <[name]> where 'name' is the key and its value is a list of key-value pairs.
    #
    #
    #puts "DEBUG: enter [info level] -> [info level 0]"
    #puts "DEBUG: enter expandTemplate [info level]"
    upvar 1 ${varTemp} tempDict

    set rounds 1
    while { ${rounds} > 0 } {
	set inExpression 0
	incr rounds -1
	while { [regexp {<(~)(([^~]|\n)+)~>} $template junk kind expression] == 1 || (${inExpression} == 1 && [regexp {<(\?)(([^\?]|\n)+)\?>} $template junk kind expression] == 1)} {
	    if { ${kind} == "~" } {
		regexp -indices {<~([^~]|\n)+~>} $template position
	    } else {
		regexp -indices {<\?([^?]|\n)+\?>} $template position
	    }
	    #puts "FOUND($position)-kind($kind)-EXPRESSION(${expression}) END EXPRESSION LVL(${lvl})"
	    #set inExpression 1
	    set replacement ""
	    set parts [scanString ${expression}]
	    puts stderr "Parts(${parts})"
	    #puts stderr "PARTS-COUNT([llength ${parts}])"
	    set min 0
	    set max -1
	    set setVar expandVar
	    catch { unset localDict }
	    array get localDict 
	    set haveText 0
	    set condText 0
	    set crossProduct 0
	    set crossProductCond 0
	    set condFalse ""
	    set condTrue ""
	    foreach part ${parts} {
		set token [lindex ${part} 0]
		set value "none"
		catch {set value [lindex ${part} 1]}
		#puts stderr "part($part)"
		if { $haveText } {
		    switch -regex ${token} {
			"text|group|func|assignvar|assignlist|condtrue|condfalse|end" {
			    append replacement [expandVars [list localDict tempDict] [set $setVar]]
			    set haveText 0
			}
		    }
		}
		switch ${token} {
		    "EO" { }
		    "EC" { }
		    "range1" {
			set range [regsub -all {\{\}} [split [lindex ${value} 0] {,}] {0}]
			set min 0
			set max [lindex ${range} 0]
		    }
		    "range2" {
			set range [regsub -all {\{\}} [split [lindex ${value} 0] {,}] {0}]
			set min [lindex ${range} 0]
			set max -1
		    }
		    "range3" {
			set range [regsub -all {\{\}} [split [lindex ${value} 0] {,}] {0}]
			set min 0
			set max [lindex ${range} 1]
		    }
		    "range4" {
			set range [regsub -all {\{\}} [split [lindex ${value} 0] {,}] {0}]
			set min [lindex ${range} 0]
			set max [lindex ${range} 1]
		    }
		    "range5" {
			set range [regsub -all {\{\}} [split [lindex ${value} 0] {,}] {0}]
			set min [lindex ${range} 0]
			set max [lindex ${range} 1]
		    }
		    "conditional" {
			#puts stderr "CONDITIONAL $parts"
			set haveText 0
			set condVar [regsub {^\<\?} ${value} {}]
			set condVar [regsub {\?\>$} ${condVar} {}]
			set conditionVar [expandTemplate tempDict ${condVar} [expr ${lvl} + 1]]
			if { ${conditionVar} != 0 } {
			    set tmptxt ${condTrue}
			} else {
			    set tmptxt ${condFalse}
			}
			append replacement [expandTemplate tempDict $tmptxt [expr ${lvl} + 1]]
			catch {unset tmptxt}
			set condFalse ""
			set condTrue ""
		    }
		    "condtrue" { 
			if { ${crossProduct} == 0 } {
			    set haveText 0
			    set condText 1
			    set setVar condTrue
			} else {
			    set crossProductCond 1
			    set setCrossVar arrayTrue
			}
		    }
		    "condfalse" { 
			if { ${crossProduct} == 0 } {
			    set haveText 0
			    set condText 1
			    set setVar condFalse
			} else {
			    set crossProductCond 1
			    set setCrossVar arrayFalse
			}
		    }
		    "func0"  -
		    "funcN" {
			set func [split [regsub {,$} [regsub -all {\)} [regsub -all {\(} [regsub -all {\}>$} [regsub -all {^<\{} ${value} {}] {}] {,}] {}] {}] {,}]
			if { ${token} == "func0" } {
			    # we know that there are no args, prune out the potential empty case of the ','
			    set func [lindex ${func} 0]
			}
			set haveText 0
			catch {unset func1}
			foreach f ${func} {
			    lappend func1 [expandVars [list tempDict localDict] ${f}]
			}
			set val [expandTemplate [list localDict tempDict] [eval ${func1}]]
			append replacement ${val}
		    }
		    "ridef" {
			set haveText 1
			#set expandVar [expandVars [list localDict tempDict] ${value}]
			set expandVar ${value}
			set setVar expandVar
			#puts stderr "def(${expandVar})"
		    }
		    "idef" {
			set haveText 1
			#set expandVar [expandVars [list localDict tempDict] ${value}]
			set expandVar ${value}
			set setVar expandVar
			#puts stderr "def(${expandVar})"
		    }
		    "def" {
			set haveText 1
			#set expandVar [expandVars [list localDict tempDict] ${value}]
			set expandVar ${value}
			set setVar expandVar
			#puts stderr "def(${expandVar})"
		    }
		    "text" {
			if { ${crossProductCond} == 0 } {
			    if { ${condText} } {
				set haveText 0
				set condText 0
			    } else {
				set haveText 1
				set setVar expandVar
			    }
			    set ${setVar} [regsub {\`>$} [regsub {^<\`} ${value} {}] {}]
			} else {
			    set ${setCrossVar} [regsub {\`>$} [regsub {^<\`} ${value} {}] {}]
			    set crossProductCond 0
			}
		    }
		    "group" {
			set haveText 1
			set setVar expandVar
			set expandVar "<~"
			append expandVar [string range ${value} 2 [expr [string length ${value}] - 3]]
			append expandVar "~>"
		    }
		    "assignvar" {
			set haveText 0
			# add the variable and set/update its value
			regexp -- {<=<\#([a-z][a-z0-9_]*)\#><=><`(([^`]|\n)+)`>=>} ${value} -> localVarName localVarValue
			switch ${localVarName} {
			    "include" {
				set fileName [expandTemplate [list localDict tempDict] ${oFile} [expr ${lvl} + 1]]
				set file [open ${fileName} r]
				set rtxt [read ${file}]
				close ${file}
			    }
			    default {
				array set localDict [list "<\#${localVarName}\#>" ${localVarValue}]
			    }
			}
		    }
		    "assignlist" {
			set haveText 0
			# add the variable and set/update its value to a list
		    }
		    "indirectarray" -
		    "arrayFunc0" -
		    "arrayFuncN" -
		    "array" {
			if { ${token} == "indirectarray" } {
			    set invarName [regsub -all {(\<\[)|(\]\>)} ${value} {}]
			    set part [lreplace ${part} 1 1 "<\[[expandTemplate [list tempDict] ${invarName}]\]>"]
			} elseif { ${token} == "arrayFunc0" } {
			    error "arrayFunc0 NOT IMPLEMENTED"
			} elseif { ${token} == "arrayFuncN" } {
			    error "arrayFuncN NOT IMPLEMENTED"
			}
			if { ${haveText} } {
			    set haveText 0
			    set tst [catch {llength $tempDict([lindex ${part} 1])} setVal]
			    if { ${tst} == 0 && ${setVal} > 0 } {
				#puts stderr "EXPAND ARRAY (${setVal}) (${value})"
				set cnt 0
				set listName [regsub -all {(\<\[)|(\]\>)|(\<\#)|(\#\>)} [regsub {[&]} ${value} {\\&}] ""]
			        set arrayLength [llength $tempDict(${value})]
				set arrayElements $tempDict(${value})
				foreach element ${arrayElements} {
				    puts stderr "CNT(${cnt}) crossProductCond(${crossProductCond}) lvl(${lvl})"
				    if { [expr ${cnt} + 1] < ${min} } {
					incr cnt
					continue
				    }
				    catch {array unset varT}
				    array set varT [array get tempDict]
				    array set varT [array get localDict]
				    array set varT [list "<\#${listName}.elementindex\#>" [expr $cnt + 1]]
				    array set varT [list "<\#${listName}.elementindexmin\#>" ${min}]
				    array set varT [list "<\#${listName}.elementindexmax\#>" ${max}]
				    array set varT [list "<\#${listName}.numberofelements\#>" ${arrayLength}]
				    #puts stderr "[array get varT]"
				    foreach keyval ${element} {
					array set varT [list "<\#[lindex ${keyval} 0]\#>" [lindex ${keyval} 1]]
				    }
				    incr cnt
				    if { ${crossProductCond} == 0 } {
					append replacement [expandTemplate [list varT] [set $setVar] [expr ${lvl} + 1]]
				    } elseif { ( ${max} > 0 && ${cnt} < ${max} ) || ( ${cnt} < ( ${arrayLength} )) } {
					append replacement [expandTemplate [list varT] [set $setVar][set arrayTrue] [expr ${lvl} + 1]]
				    }
				    if { ${max} > 0 && ${cnt} >= ${max} } {
					break
				    }
				}
				if { ${crossProductCond} == 1 } {
				    append replacement [expandTemplate [list varT] [set $setVar][set arrayFalse] [expr ${lvl} + 1]]
				}
			    } else {
				# its empty so just replace it with nothing
				set replacement ""
			    }
			} else {
			    # lefthand side of <*> appears to be an array
			}
			set crossProduct 0
		    }
		    "multi" { 
			# we need to push the conditional values if they have been set
			# because we may have conditionals as part of the cross product
			# operator
			set crossProduct 1
			set crossProductCond 0
		    }
		    "multiCond" { 
			set crossProduct 1
			set crossProductCond 1
			set condTrueType [lindex ${part} 2]
			set condTrueText [lindex ${part} 3]
			set condFalseType [lindex ${part} 4]
			set condFalseText [lindex ${part} 5]
			puts "part($part)"
			puts stderr "condTrue($condTrueType)($condTrueText)"
			puts stderr "condFalse($condFalseType)($condFalseText)"
			if { [string compare ${condTrueType} "text"] == 0 } {
			    set arrayTrue [string range ${condTrueText} 1 end-1]
			} else {
			    set arrayTrue ${condTrueText}
			}
			if { [string compare ${condFalseType} "text"] == 0 } {
			    set arrayFalse [string range ${condFalseText} 1 end-1]
			} else {
			    set arrayFalse ${condFalseText}
			}
			puts stderr "true($arrayTrue) false($arrayFalse)"
		    }
		}
	    }
	    catch {unset tmp}
	    append tmp [string range $template 0 [expr [lindex $position 0] - 1]]
	    append tmp $replacement
	    append tmp [string range $template [expr [lindex $position 1] + 1] end]
	    set template $tmp
	    #puts "REPLACED($replacement)"
	}
	
	set template [expandVars [list localDict tempDict] ${template}]
	#puts "DEBUG: exit expandTemplate [info level]"
    }

    if { ${lvl} == 0 } {
	# 
	# If we are at lvl zero, we can do the output file if it
	# has been specified.
	#
	if { [catch {resolveVar [list localDict tempDict] {<\#outputfile\#>}} oFile] == 0 } {
	    # expand and then write to file
	    set fileName [expandTemplate [list localDict tempDict] ${oFile} [expr ${lvl} + 1]]
	    set file [open ${fileName} w]
	    write ${file} ${template}
	    close ${file}
	}
    }

    return ${template}
}

# this procedure is private!!
proc expandVars { varTemp instance {setNoChange 1}} {
    #puts "DEBUG: enter [info level] -> [info level 0]"
    #puts "expandVars(${instance})"
    foreach upArr [lreverse ${varTemp}] {
	upvar 1 ${upArr} temp_${upArr}
	array set localTemp [array get temp_${upArr}] 
    }
    set noChange ${setNoChange}

    # match <{stuff}> -- Function calls
    while { [regexp {<(\{)(([^\{]|\n)+)\}>} ${instance} junk kind expression] == 1 } {
	if { ${kind} == "\{" } {
	    regexp -indices {<\{([^\{]|\n)+\}>} ${instance} position
	}
	puts "expandVars - FOUND($position)-kind($kind)-EXPRESSION(${expression})"
	set noChange ${setNoChange}
	while { ${noChange} } {
	    set noChange 0
	    foreach {name val} [array get localTemp] {
		regsub -all {([:\"<>\[\]{}.\\^$~!@()&])} ${name} {\\\1} name
		set change [regsub -all ${name} ${expression} "\$localTemp(${name})" expression]
		incr noChange ${change}
	    }
	}

	regsub -all {&} ${expression} {\\\&} expression
	set func [split [regsub {,$} [regsub {\)$} [regsub {\(} [regsub -all {\}>$} [regsub -all {^<\{} ${expression} {}] {}] {,}] {}] {}] {,}]
	catch {unset replacement}
	if { [lindex ${func} 0] == "lookup" } {
	    set val [resolveVar ${varTemp} [lindex ${func} 1]]
	} else {
	    set txt ""
	    for { set cnt 0 } { ${cnt} < [llength ${func}] } { incr cnt } {
		#puts "set var${cnt} \[subst \[lindex ${func} ${cnt}\]\]"
		set var${cnt} [subst [lindex ${func} ${cnt}]]
		#puts "var${cnt} (set var${cnt}) = ([set var${cnt}])"
		append txt "\$var${cnt} "
	    }
	    puts stderr "EVAL($func)"
	    set val [eval ${txt}]
	    for { set cnt 0 } { ${cnt} < [llength ${func}] } { incr cnt } {
		unset var${cnt}
	    }
	}
	append replacement ${val}
	
	catch {unset tmp}
	append tmp [string range ${instance} 0 [expr [lindex ${position} 0] - 1]]
	append tmp ${replacement}
	append tmp [string range ${instance} [expr [lindex ${position} 1] + 1] end]
	set instance ${tmp}
    }

    while { [regexp {<([\#]{1,2})([a-zA-Z][a-zA-Z_0-9.-]*)[\#]{1,2}>} ${instance} matched kind name] >= 1 } {
	if { ${kind} == "\#\#" } {
	    puts "recursive-1($matched)($name)"
	    # recursive indirect variable
	    # we expect that name is a <#name#> form whose value can then be used as name
	    # when <#name#> fails to be a legal name, then name is used as a value
	    while { [regexp {^[a-zA-Z][a-zA-Z_0-9.-]*$} ${name}] >= 1 } {
		# name is a proper variable name
		puts "recursive-2($matched)($name)"
		set name [lindex [array get localTemp "\<\#${name}\#\>"] 1]
	    }
	    set value ${name}
	} else {
	    set value [lindex [array get localTemp ${matched}] 1]
	}
	regsub -all {[\\]*&} ${value} {\\\&} value
	#puts stderr "cl([info level]) n(${matched}) i(${instance}) v(${value})"
	# ok so we are going to do a replacement
	# note that the replaced value could be an expression
	# therefore, we will call expandTemplate, which will likely
	# recursively call us again. If 'instance' is just clear
	# text, then not much will happen.
	set val2 [expandTemplate localTemp ${value}]
	regsub -all {[\\]*&} ${val2} {\\\&} val2
	regsub -all ${matched} ${instance} ${val2} instance2
	set instance ${instance2}
    }
    return ${instance}
}

# this procedure is private!!
proc resolveVar { listOfArray varName } {
    #puts "DEBUG: enter [info level] -> [info level 0]"
    foreach arr ${listOfArray} {
	set local temp_${arr}
	upvar 2 ${arr} ${local}
	if { [array name ${local} ${varName}] != "" } {
	    #puts "return([array get ${local} ${varName}])"
	    return [array get ${local} ${varName}]
	}
    }

    error "${varName} not exist in ${listOfArray}"
}

#source mergeExpression.tcl
# This is only executed once, at load time.
if { [lsearch [info commands lreverse] lreverse] == -1 } {
    proc lreverse { l } {
	for { set cnt [llength ${l}]} { ${cnt} >= 0 } { incr cnt -1 } {
	    lappend nl [lindex ${l} [expr ${cnt} - 1]]
	}
	return ${nl}
    }
}
