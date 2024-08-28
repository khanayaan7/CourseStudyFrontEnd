import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import IconBtn from '../../common/IconBtn';
import { setCompletedLectures, setCourseSectionData, setEntireCourseData, setTotalNoOfLectures } from '../../../slices/viewCourseSlice';
import { BsChevronDown } from "react-icons/bs"
import { IoIosArrowBack } from "react-icons/io"
import { removeCompletedLectures,updateCompletedLectures } from '../../../slices/viewCourseSlice';
import {markLectureRemoved,markLectureAsComplete } from '../../../services/operations/courseDetailsAPI';

const VideoDetailsSidebar = ({setReviewModal}) => {

    const [activeStatus, setActiveStatus] = useState("");
    const [videoBarActive, setVideoBarActive] = useState("");
    const {token} = useSelector((state)=>state.auth);
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const location = useLocation();
    const {sectionId, subSectionId} = useParams();
    const {
        courseSectionData,
        courseEntireData,
        totalNoOfLectures,
        completedLectures,
    } = useSelector((state)=>state.viewCourse);

    
    
    useEffect(() => {
      const setActiveFlags = () => {
        if(!courseSectionData.length) return;
        // console.log("In Sidebar, courseSectionData",courseSectionData)
        const currentSectionIndex = courseSectionData.findIndex(
            (sec) => sec._id === sectionId)

        const currentSubSectionIndex =  courseSectionData?.[currentSectionIndex].subSection.findIndex(
            (subSec)=> subSec._id === subSectionId
        )    

        setActiveStatus(courseSectionData?.[currentSectionIndex]?._id)
        setVideoBarActive(courseSectionData?.[currentSectionIndex].subSection?.[currentSubSectionIndex]?._id )
      }
      
      setActiveFlags();

      
    }, [courseSectionData, courseEntireData, location.pathname])
    
    useEffect(() => {
      
    
        return () => {
            dispatch(setCourseSectionData([]));
            
            dispatch(setEntireCourseData([]));
            
            dispatch(setCompletedLectures(0))
          }
    },[])
    
    const handleAddReview = () => {
        // console.log("I am inside Add handleAddReview")
        setReviewModal(true);
    }
    const handleLectureDeletion = async(courseId,subSectionId) => {

        // setLoading(true);
        // console.log("In VideoDetails",courseId,subSectionId)
        const res = await markLectureRemoved({courseId,subSectionId}, token);
        //state update
        if(res) {
            dispatch(removeCompletedLectures(subSectionId)); 
        }
        // setLoading(false);
    
      }
      const handleLectureCompletion = async(courseId,subSectionId) => {

        // setLoading(true);
        const res = await markLectureAsComplete({courseId: courseId,subSectionId: subSectionId}, token);
        //state update
        if(res) {
            dispatch(updateCompletedLectures(subSectionId)); 
        }
        // setLoading(false);
    
      }
  return (
    <>
        <div className="flex h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800">
            {/* for buttons and headings */}
            <div className="mx-5 flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-richblack-600 py-5 text-lg font-bold text-richblack-25">
                {/* for buttons */}
                <div className="flex w-full items-center justify-between ">
                    <div 
                    onClick={()=> {
                        navigate("/dashboard/enrolled-courses")
                    }}
                    className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90"
                    title="back"
                    >
                        <IoIosArrowBack size={30} />
                    </div>

                    <div>
                        <IconBtn 
                            text="Add Review"
                            customClasses="ml-auto"
                            onclick={() => handleAddReview()}
                        />
                    </div>

                </div>
                {/* for heading or title */}
                <div className="flex flex-col">
                    <p>{courseEntireData?.courseName}</p>
                    <p className="text-sm font-semibold text-richblack-500">{completedLectures?.length} / {totalNoOfLectures}</p>
                </div>
            </div>

            {/* for sections and subSections */}
            <div  className="h-[calc(100vh - 5rem)] overflow-y-auto">
                {
                    courseSectionData.map((course, index)=> (
                        <div
                        className="mt-2 cursor-pointer text-sm text-richblack-5"
                        onClick={() => setActiveStatus(course?._id)}
                        key={index}
                        >

                            {/* section */}

                            <div className="flex flex-row justify-between bg-richblack-600 px-5 py-4">
                                <div className="w-[70%] font-semibold">
                                    {course?.sectionName}
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* <span className="text-[12px] font-medium">
                                        Lession {course?.subSection.length}
                                    </span> */}
                                    <span
                                        className={`${
                                        activeStatus === course?._id
                                            ? "rotate-0"
                                            : "rotate-180"
                                        } transition-all duration-300`}
                                    >
                                        <BsChevronDown />
                                    </span>
                                </div>
                            </div>

                            {/* subSections */}
                            <div>
                                {
                                    activeStatus === course?._id && (
                                        <div>
                                            {
                                                course.subSection.map((topic, index) => (
                                                    <div
                                                    className={`flex gap-3  px-5 py-2 ${
                                                        videoBarActive === topic._id
                                                        ? "bg-yellow-200 font-semibold text-richblack-800"
                                                        : "hover:bg-richblack-900"
                                                    }`}
                                                    key={index}
                                                    onClick={() => {
                                                        navigate(
                                                            `/view-course/${courseEntireData?._id}/section/${course?._id}/sub-section/${topic?._id}`
                                                        )
                                                        setVideoBarActive(topic?._id);
                                                    }}

                                                    >
                                                        <input
                                                        type='checkbox'
                                                        checked= {completedLectures.includes(topic?._id)}
                                                        onChange={()=> completedLectures.includes(topic?._id) ?handleLectureDeletion(courseEntireData?._id,topic?._id):(handleLectureCompletion(courseEntireData?._id,topic?._id))}
                                                        />
                                                        <span>
                                                            {topic.title}
                                                        </span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    </>
  )
}

export default VideoDetailsSidebar
