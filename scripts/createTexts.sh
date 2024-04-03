#!/bin/bash
#Modifiable options
#TODO should be input
FOLDER=verses
COLLECTIVE_FOLDER=../assets/gt.r/verses
NUM_VERSES_PER_FILE=50
INPUT_IDS="versesIds.txt"
INPUT_TEXT="verses.txt"
NUM_CHARS_PER_PAGE=200

#Dont change
STOP_LABELS=()
STOP_LABELS+=("ۗ")
STOP_LABELS+=("ۖ")
STOP_LABELS+=("ۚ")
STOP_LABELS+=("ۘ")
STOP_LABELS+=("ۙ")
STOP_LABELS+=("ۛ")
STOP_LABELS_LENGTH=${#STOP_LABELS[@]}
MIN_CHARS_PER_PAGE=22
NUM_VERSES=6235
# NUM_VERSES_PER_FILE=$(($NUM_VERSES / $NUM_FILES + 1 ))

#start script
if (( $NUM_CHARS_PER_PAGE < $MIN_CHARS_PER_PAGE )); then
  echo "Num chars per page cant be less than "$MIN_CHARS_PER_PAGE
  exit 1
fi  

rm -rf $FOLDER 
mkdir $FOLDER

rm -rf $COLLECTIVE_FOLDER
mkdir $COLLECTIVE_FOLDER

ids=()
while IFS= read -a id
do
    ids+=($id)
done < "$INPUT_IDS"

i=-1
while IFS= read -a text
do
  i=$((i + 1))
  if (( i%NUM_VERSES_PER_FILE == 0 )); then
    curFilePath=$COLLECTIVE_FOLDER"/verses_"$(( $i / $NUM_VERSES_PER_FILE ))
    touch $curFilePath
  fi
  # if (( $i%10 == 0 )); then
  echo ${ids[i]}
  # fi  

  words=( $text )
  numWords=${#words[@]}
  ayaId=${ids[i]/:/_}
  path="$FOLDER/$ayaId"
  len=${#text}
  lens=()

  if (( $len <= $NUM_CHARS_PER_PAGE )); then
    echo $text > $path
    echo $text >> $curFilePath
  else
    lastStart=0
    lenSoFar=0
    header=""
    separator=""
    newline=$'\n'
    slices=()
    numWordsSoFar=-1
    for (( j=0; j<$numWords; j++ ))
    do
      numWordsSoFar=$(( $numWordsSoFar + 1 ))
      word="${words[j]}"
      wordLen=${#words[j]}
      skipped=0
      for (( k=0; k<$STOP_LABELS_LENGTH; k++ ))
      do
        if [[ "$word" == "${STOP_LABELS[k]}"  ]]; then
          skipped=1
          numWordsSoFar=$(( $numWordsSoFar - 1 ))
        fi
      done

      lenSoFar=$(( $lenSoFar + $wordLen + 1 ))
      if (( $lenSoFar > NUM_CHARS_PER_PAGE )); then
        j=$(( j - 1))
        slice=$(printf " %s" "${words[@]:$lastStart:($j-$lastStart)}")
        slices+=("$slice")
        header=$header$separator$numWordsSoFar
        separator=","
        lastStart=$j
        lenSoFar=0
      fi
    done
    slice=$(printf " %s" "${words[@]:$lastStart:($numWords-$lastStart)}")
    header=$header","$numWordsSoFar
    slices+=("$slice")
    numSlices=${#slices[@]}

    echo $header > $path
    echo $header >> $curFilePath
    for (( j=0; j<$numSlices; j++ ))
    do
      echo ${slices[j]} >> $path
      echo ${slices[j]} >> $curFilePath
    done
  fi

  echo "" >> $curFilePath
  echo "" >> $curFilePath

done < "$INPUT_TEXT"