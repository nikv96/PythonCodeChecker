#This program is designed to get an inputword and suggest a correction 
import time
#This function reads big.txt
def readbig():
        Start_time=time.time()
        global list_of_words #database of words
        list_of_words = []
        with open('SpellCheck/big.txt','r') as myFile:
                tempword = ''#Temporary word to make changes to before uploading in the database
                for line in myFile:
                        line = line.lower()
                        for char in line:
                                if char.isalpha() or char == '(' or char == "_":#Only alphabets,- or ' is acceptable
                                        tempword+=char
                                elif tempword !='':
                                        list_of_words.append(tempword)
                                        tempword = ''

        templist = set(list_of_words)  #to remove all duplicates in corpus
        list_of_words = list(templist)

#this function computes word distance of two words and returns the value
def worddist(inputword,word):
        if len(word)<len(inputword):#toassign a small word and large word
                smallword = word
                bigword = inputword
        else:
                smallword = inputword
                bigword = word

        if abs(len(inputword)-len(word))>2: #length diff <2 is dealt with in the following cases. These statements execute for any worddist>2
                word_dist1=word_dist2=0#word_dist1 keeps check of the length diff and word_dist2 keeps check of the char difference
                word_dist1 = len(bigword)-len(smallword)
                for i in range (len(smallword)):#this loop directly compares the letters of the word and counts any mismatch
                        if smallword[i] != bigword[i]:
                                word_dist2 +=1
                if word_dist2 == 0:#this condition is to further check if there are char mismatches
                        for i in bigword:
                                if i not in smallword:
                                        word_dist2 +=1
                return word_dist2+word_dist1 #the sum of the length and char diff is returned to account for entire worddist
                
                
                
        elif len(smallword)!=len(bigword) :#these statements check for worddist 1 or 2 when the lengths don't match
                flag = 0 
                tempword = '' #tempword is created to modify the existing word
                for i in range (len(bigword)):#this for loop basically removes one char at a time from the bigword and check if smallword is present in the tempstring
                        tempword = ' '+bigword[:i] + bigword[(i+1):]
                        if tempword in smallword or smallword in tempword and abs(len(word)-len(inputword))<2:
                                flag =1
                                break
                if flag ==1:
                        return 1 #any mismatch in the above statements implies a worddist of 1. 
                flag = 0

                for i in range (len(bigword)):#this for loop checks worddist of 2 by removing two chars at a time
                        for j in range (0,len(bigword)):
                                if j <= i:
                                       tempword = ' '+bigword[:j] + bigword[(j+1):i] + bigword[i+1:]
                                else:
                                        tempword = ' '+bigword[:i] + bigword[(i+1):j] + bigword[j+1:]
                                if  tempword in smallword or smallword in tempword:
                                        flag+= 1
                                        break
                if flag !=0:
                       return 2
                

        else:#these statements are executed if worddist<=2 and lengths don't match
                flag = 0
                tempword1=tempword2 = ''#tempword1 and 2 are to store modifications of the words
                for i in range( len(smallword)):#this loop test the case when the worddist is 1 with just a single char replacement
                        tempword1 = (smallword[:i]+smallword[i+1:])#one char is removed from the word and stored in tempword
                        tempword2 = (bigword[:i]+bigword[i+1:])
                        if tempword1 == tempword2:
                                flag =1
                                break
                if flag ==1:
                        return 1

                flag = 0

                for i in range (len(smallword)):#this loop test the case when the worddist is 2 with 2 chars replacement
                        for j in range (len(bigword)):
                                if j <= i:
                                       tempword2 = (bigword[:j] + bigword[(j+1):i] + bigword[i+1:])#2 chars are removed at a time and result stored in temp word
                                       tempword1 = (smallword[:j] + smallword[(j+1):i] + smallword[i+1:])
                                else:
                                        tempword2 = (bigword[:i] + bigword[(i+1):j] + bigword[j+1:])
                                        tempword1 = (smallword[:i] + smallword[(i+1):j] + smallword[j+1:])
                                if  tempword1 == tempword2:
                                        flag+= 1
                                        break
                if flag != 0:
                        return 2

        if len(bigword)-len(smallword) == 0 and smallword[0] == bigword[0]:#this case test when the above cases have not been executed and length diff is zero
                error = 0 #counts the mismatches directly
                for i in range(len(smallword)):
                        if smallword[i]!=bigword[i]:
                                error+=1
                return error
        
        return 100 #if all the above cases have not been executed then the words are completely unrelated. 100 is a large no. and hence set as default.\
                        #purpose of setting 100 is because the words are sorted according to word dist later and min worddist words are displayed
                        #100 is improbable to be the minimum

#this function performs main autocorrect task and calls worddist
def autocorrect(inputword):
    Start_time=time.time()
    worddist_list = {}
    if ' ' in inputword:#error if sentence is provided
            print("\nError! More than one word")
            
    else:
            length = len(inputword)
            i=0
            while i<length:#this replaces the unknown chars in the inputword
                    if inputword[i].isalpha()==False and inputword[i] !='-' and not(inputword[i]=="'"):
                            inputword.replace(inputword[i],'')
                    if inputword[i] == "'" and i != len(inputword)-1 and i != len(inputword)-2:
                            inputword = inputword[:i]+inputword[i+1:]
                            length -=1
                    i+=1    
                            
            
            for word in list_of_words:#this for loop creates a dictionary with worddist as keys and a list of words as values
                    if (worddist(inputword,word) not in worddist_list.keys()):
                            worddist_list[worddist(inputword,word)]=[word]
                    else:
                            worddist_list[worddist(inputword,word)].append(word)
            minworddist = min(worddist_list.keys())#words with min word dist are only printed
            print_list = []
            for word in worddist_list[minworddist]:
                if "(" in word:
                    print_list.append(word[:len(word)-1])
                else:
                    print_list.append(word)
            print "Did you mean: ", print_list
            list_of_words.append(inputword)
       
#this function provides the top menu
def menu():
        ch=0
        readbig()
        inputword = raw_input()
        autocorrect(inputword)
                                              
menu()        
    
                    
    
    
                    
    
