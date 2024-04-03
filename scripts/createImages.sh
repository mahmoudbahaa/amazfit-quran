#!/bin/bash
FONT=./Noto-Sans-Regular.ttf
# 26 almost equal to 32 on device
TEXT_SIZE=26 
FOLDER=verses_img
OIFS=$IFS
INPUT_IDS="versesIds.txt"
INPUT_TEXT="verses.txt"
NUM_CHARS_PER_PAGE=207
BG_COLOR=none
LINE_HEIGHT=49
# 1-5 No
# 6 => 208
# 7 => 207
# 8-9 => No
NUM_LINES=7
MAX_HEIGHT=$(( $LINE_HEIGHT * $NUM_LINES ))
SIZE=$(bc <<< "scale=0; sqrt(217156 - $MAX_HEIGHT * $MAX_HEIGHT)")
SKIP=0

echo $SIZE
echo $MAX_HEIGHT

ids=()
mv $FOLDER $FOLDER"_backup" 
rm -rf $FOLDER 
mkdir $FOLDER

while IFS= read -a id
do
    ids+=($id)
done < "$INPUT_IDS"

convert() {
  magick -background $BG_COLOR -fill white -gravity center -size $SIZE -define "pango:align=center" -font $FONT -pointsize $TEXT_SIZE pango:"$slice" $fullPath.png
  status=$?
  if (( $status == 2 )); then
    exit $status
  fi

  if (( $status != 0 )); then
    convert
  fi

  aya_part_size=$(identify -format "%G" $fullPath.png)
  aya_part_height=$(echo $aya_part_size | awk -F 'x' '{print $2}')
   if (( $aya_part_height > $MAX_HEIGHT )); then
    echo "Constraint violated"
    echo $aya_part_size
    echo $path
    echo $i
    exit 1
  fi
}

i=-1
while IFS= read -a text
do
  i=$((i + 1))

  if (( $i < $SKIP )); then
    continue
  fi

  echo $i"="${ids[i]}
  ayaId=${ids[i]/:/_}
  words=( $text )
  len=${#text}
  numWords=${#words[@]}
  path="$FOLDER/$ayaId"
  if (( $len <= $NUM_CHARS_PER_PAGE )); then
    slice=$text
    fullPath=$path
    convert
  else
    lastStart=0
    lenSoFar=0
    for (( j=0; j<$numWords; j++ ))
    do
      wordLen=${#words[j]}
      lenSoFar=$(( $lenSoFar + $wordLen + 1 ))
      if (( $lenSoFar > $NUM_CHARS_PER_PAGE )); then
        slice=$(printf " %s" "${words[@]:$lastStart:($j-$lastStart)}")
        fullPath=$path"_"$j
        convert
        lastStart=$j
        lenSoFar=$(( $wordLen + 1 ))
      fi
    done
    slice=$(printf " %s" "${words[@]:$lastStart:($numWords-$lastStart)}")
    fullPath=$path"_"$numWords
    convert
  fi
  
done < "$INPUT_TEXT"

IFS=$OIFS

# mogrify -strip "$FOLDER/*.png"